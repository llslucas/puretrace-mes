import { Stream } from 'effect';
import { MachineTelemetry } from './telemetry.schema';

export abstract class TelemetryListener {
  abstract listen(): Stream.Stream<MachineTelemetry>;
}
