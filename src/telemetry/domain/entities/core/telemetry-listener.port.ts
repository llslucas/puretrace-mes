import { Stream } from 'effect';
import { TelemetryData } from './telemetry-data.interface';

export abstract class TelemetryListener<DataType = unknown> {
  abstract listen(): Stream.Stream<TelemetryData<DataType>>;
}
