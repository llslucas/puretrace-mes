import { Effect } from 'effect';
import { TelemetryDataProcessingError } from 'src/telemetry/domain/entities/core/telemetry.errors';
import { TelemetryData } from './telemetry-data.interface';

export abstract class TelemetryHandler<DataType = unknown> {
  abstract match(topic: string): boolean;
  abstract handle(
    topic: string,
    payload: Buffer,
  ): Effect.Effect<TelemetryData<DataType>, TelemetryDataProcessingError>;
}

export const TELEMETRY_HANDLER = Symbol('TELEMETRY_HANDLER');
