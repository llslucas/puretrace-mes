import { Console, Effect, Schema } from 'effect';
import { TelemetryDataProcessingError } from '../../entities/core/telemetry.errors';
import {
  ProductionEventDataModel,
  ProductionEventDto,
} from '../../entities/models/production-event-data.model';

export class ProcessProductionEventUseCase {
  execute([previous, current]: unknown[]) {
    return Effect.gen(function* (_) {
      const rawData = [previous, current];

      const data = yield* _(
        Schema.decodeUnknown(Schema.Array(ProductionEventDto))(rawData).pipe(
          Effect.mapError(
            (e) =>
              new TelemetryDataProcessingError({
                step: 'SCHEMA_VALIDATION',
                originalError: e,
              }),
          ),
        ),
      );

      const telemetry = ProductionEventDataModel.create(data);

      return telemetry;
    });
  }
}
