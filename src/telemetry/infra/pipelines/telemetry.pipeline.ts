import { Inject, Injectable } from '@nestjs/common';
import {
  TELEMETRY_HANDLER,
  TelemetryHandler,
} from '../handlers/telemetry-handler.interface';
import { Console, Effect, PubSub, Schedule, Stream } from 'effect';
import { MachineTelemetry } from '../..//domain/entities/telemetry.schema';
import { TelemetryDataProcessingError } from '../..//domain/entities/telemetry.errors';

export interface RawMessage {
  topic: string;
  payload: Buffer;
}

@Injectable()
export class TelemetryPipeline {
  constructor(
    @Inject(TELEMETRY_HANDLER)
    private readonly handlers: TelemetryHandler | TelemetryHandler[],
  ) {}

  build(
    sourceStream: Stream.Stream<RawMessage>,
    pubSub: PubSub.PubSub<MachineTelemetry>,
  ): Effect.Effect<void> {
    const handlers = this.handlers;

    const pipeline = sourceStream.pipe(
      Stream.tap((msg) =>
        Console.log(`[DEBUG] Stream recebeu tópico: ${msg.topic}`),
      ),

      Stream.mapEffect(
        ({ topic, payload }) =>
          Effect.gen(function* (_) {
            let handler;

            if (Array.isArray(handlers)) {
              handler = handlers.find((h) => h.match(topic));
            } else {
              handler = handlers;
            }

            if (!handler) {
              return yield* _(
                Effect.logDebug(`Tópico desconhecido ignorado: ${topic}`),
              );
            }

            const processedData = yield* _(
              handler.handle(topic, payload).pipe(
                Effect.timeout('5 seconds'),
                Effect.catchAll((error) =>
                  Effect.logError(
                    error instanceof TelemetryDataProcessingError
                      ? `⚠️ Mensagem descartada: [${error.step}] ${error.originalError.message}`
                      : `⚠️ [Timeout] ${topic}`,
                  ).pipe(Effect.as(null)),
                ),
              ),
            );

            if (processedData) {
              yield* _(PubSub.publish(pubSub, processedData));
              yield* _(Console.log(`[DEBUG] Publicado no PubSub: ${topic}`));
            }
          }),
        { concurrency: 'unbounded' },
      ),
      Stream.runDrain,
    );

    const failPolicy = Schedule.exponential('1 second').pipe(
      Schedule.union(Schedule.spaced('1 minute')),
    );

    const program = pipeline.pipe(
      Effect.catchAllCause((cause) =>
        Effect.logFatal(
          `Falha na Pipeline: ${cause.toString()}\n\nREINICIANDO...`,
        ).pipe(Effect.flatMap(() => Effect.fail(cause))),
      ),
      Effect.sandbox,
      Effect.retry(failPolicy),
      Effect.unsandbox,
      Effect.orDie,
    );

    return program;
  }
}
