import { Injectable } from '@nestjs/common';
import { Effect, Option } from 'effect';
import {
  EnvironmentData,
  EnvironmentDataModel,
} from 'src/telemetry/domain/entities/models/environment-data.model';
import { TelemetryHandler } from '../../domain/entities/core/telemetry-handler.interface';
import { TelemetryDataProcessingError } from '../../domain/entities/core/telemetry.errors';
import { ProcessEnvironmentDataUseCase } from '../../domain/features/environment/process-environment-data.use-case';

@Injectable()
export class MachineEnvironmentHandler implements TelemetryHandler<EnvironmentData> {
  match(topic: string): boolean {
    console.log(topic);
    return topic.endsWith('/environment');
  }

  handle(
    topic: string,
    payload: Buffer,
  ): Effect.Effect<
    Option.Option<EnvironmentDataModel>,
    TelemetryDataProcessingError
  > {
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

      return Option.some(yield* _(useCase.execute(json)));
    });
  }
}
