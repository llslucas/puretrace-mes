import mqtt from 'mqtt';
import { TelemetryListener } from '../../domain/entities/telemetry-listener.port';
import { MachineTelemetry } from '../../domain/entities/telemetry.schema';
import { TelemetryDataProcessingError } from '../../domain/entities/telemetry.errors';
import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Effect, PubSub, Queue, Stream, Console, Fiber } from 'effect';
import {
  TELEMETRY_HANDLER,
  TelemetryHandler,
} from '../handlers/telemetry-handler.interface';
import { RuntimeFiber } from 'effect/Fiber';

interface RawMessage {
  topic: string;
  payload: Buffer;
}

@Injectable()
export class MqttTelemetryListener
  implements TelemetryListener, OnModuleInit, OnModuleDestroy
{
  constructor(
    private readonly configService: ConfigService,
    @Inject(TELEMETRY_HANDLER)
    private readonly handlers: TelemetryHandler | TelemetryHandler[],
  ) {}

  listen(): Stream.Stream<MachineTelemetry> {
    if (!this.telemetryPubSub) return Stream.empty;
    return Stream.fromPubSub(this.telemetryPubSub);
  }

  private mqttClient: mqtt.MqttClient | null = null;
  private processingQueue: Queue.Queue<RawMessage> | null = null;
  private telemetryPubSub: PubSub.PubSub<MachineTelemetry> | null = null;
  private pipelineFiber: RuntimeFiber<any, any> | null = null;

  async onModuleInit() {
    this.processingQueue = await Effect.runPromise(Queue.sliding(1000));
    this.telemetryPubSub = await Effect.runPromise(PubSub.sliding(200));

    const brokerUrl =
      this.configService.get<string>('MQTT_URL') || 'mqtt://localhost:1883';

    this.mqttClient = mqtt.connect(brokerUrl);

    this.mqttClient.on('connect', () => {
      Effect.runSync(Effect.log(`Conectado ao Broker MQTT: ${brokerUrl}`));
      this.mqttClient?.subscribe('fabrica/maquinas/+/+');
    });

    this.mqttClient.on('message', (topic, payload) => {
      const msg = { topic, payload };

      if (this.processingQueue) {
        Effect.runSync(Queue.offer(this.processingQueue, msg));
      }
    });

    this.startPipeLine();
  }

  async onModuleDestroy() {
    if (this.pipelineFiber) {
      await Effect.runPromise(Fiber.interrupt(this.pipelineFiber));
    }

    if (this.processingQueue)
      await Effect.runPromise(Queue.shutdown(this.processingQueue));

    if (this.telemetryPubSub)
      await Effect.runPromise(PubSub.shutdown(this.telemetryPubSub));

    if (this.mqttClient) {
      this.mqttClient.end();
    }
  }

  private startPipeLine() {
    if (!this.processingQueue || !this.telemetryPubSub) return;

    const handlers = this.handlers;
    const pubSub = this.telemetryPubSub;

    const pipeline = Stream.fromQueue(this.processingQueue).pipe(
      // Stream.tap((msg) =>
      //   Console.log(`[DEBUG] Stream recebeu tópico: ${msg.topic}`),
      // ),

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
              //yield* _(Console.log(`[DEBUG] Publicado no PubSub: ${topic}`));
            }
          }),
        { concurrency: 'unbounded' },
      ),
      Stream.runDrain,
    );

    const safeProgram = pipeline.pipe(
      Effect.catchAllCause((cause) =>
        Effect.logFatal(`Falha na Pipeline: ${cause.toString()}`),
      ),
    );

    this.pipelineFiber = Effect.runFork(safeProgram);
    console.log('Pipeline de Telemetria Iniciada');
  }
}
