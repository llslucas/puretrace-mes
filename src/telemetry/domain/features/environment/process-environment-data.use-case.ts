import { Console, Effect, Schema } from 'effect';
import { TelemetryDataProcessingError } from '../../entities/core/telemetry.errors';
import {
  EnvironmentDataDto,
  EnvironmentDataModel,
} from '../../entities/models/environment-data.model';

export class ProcessEnvironmentDataUseCase {
  execute(
    input: unknown,
  ): Effect.Effect<EnvironmentDataModel, TelemetryDataProcessingError> {
    return Effect.gen(function* (_) {
      //Validate Schema
      const rawData = yield* _(
        Schema.decodeUnknown(EnvironmentDataDto)(input).pipe(
          Effect.mapError((e) => {
            return new TelemetryDataProcessingError({
              step: 'SCHEMA_VALIDATION',
              originalError: e,
            });
          }),
        ),
      );

      const telemetry = EnvironmentDataModel.create(rawData);

      if (telemetry.data.status === 'CRITICAL') {
        yield* _(
          Console.log(
            `🚨 ALERTA: Máquina ${telemetry.data.machineId} superaquecendo!`,
          ),
        );
      }

      return telemetry;
    });
  }
}
