import { Console, Effect, Schema } from 'effect';
import { TelemetryDataProcessingError } from '../entities/telemetry.errors';
import { TelemetryModel } from '../entities/telemetry.model';
import { TelemetryData } from '../entities/telemetry.schema';

export class ProcessEnvironmentDataUseCase {
  execute(input: unknown) {
    return Effect.gen(function* (_) {
      //Validate Schema
      const rawData = yield* _(
        Schema.decodeUnknown(TelemetryData)(input).pipe(
          Effect.mapError((e) => {
            return new TelemetryDataProcessingError({
              step: 'SCHEMA_VALIDATION',
              originalError: e,
            });
          }),
        ),
      );

      const telemetry = TelemetryModel.create(rawData);

      if (telemetry.status === 'CRITICAL') {
        yield* _(
          Console.log(
            `🚨 ALERTA: Máquina ${telemetry.machineId} superaquecendo!`,
          ),
        );
      }

      return telemetry;
    });
  }
}
