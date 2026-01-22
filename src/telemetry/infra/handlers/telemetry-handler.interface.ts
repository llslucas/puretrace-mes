import { Effect } from 'effect';
import { TelemetryDataProcessingError } from 'src/telemetry/domain/entities/telemetry.errors';
import { MachineTelemetry } from 'src/telemetry/domain/entities/telemetry.schema';

export abstract class TelemetryHandler {
  abstract match(topic: string): boolean;
  abstract handle(
    topic: string,
    payload: Buffer,
  ): Effect.Effect<MachineTelemetry, TelemetryDataProcessingError>;
}

export const TELEMETRY_HANDLER = Symbol('TELEMETRY_HANDLER');
