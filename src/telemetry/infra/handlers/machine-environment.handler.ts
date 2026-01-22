import { Injectable } from '@nestjs/common';
import { Effect } from 'effect';
import { MachineTelemetry } from '../../domain/entities/telemetry.schema';
import { TelemetryDataProcessingError } from '../../domain/entities/telemetry.errors';
import { ProcessEnvironmentDataUseCase } from '../../domain/features/process-environment-data.use-case';
import { TelemetryHandler } from './telemetry-handler.interface';

@Injectable()
export class MachineEnvironmentHandler implements TelemetryHandler {
  match(topic: string): boolean {
    console.log(topic);
    return topic.endsWith('/environment');
  }

  handle(
    topic: string,
    payload: Buffer,
  ): Effect.Effect<MachineTelemetry, TelemetryDataProcessingError> {
    return Effect.gen(function* (_) {
      const useCase = new ProcessEnvironmentDataUseCase();

      // Parse JSON
      const json = yield* _(
        Effect.try({
          try: () => JSON.parse(payload.toString()) as unknown,
          catch: (e) =>
            new TelemetryDataProcessingError({
              step: 'JSON_PARSE',
              originalError: e as SyntaxError,
            }),
        }),
      );

      return yield* _(useCase.execute(json));
    });
  }
}
