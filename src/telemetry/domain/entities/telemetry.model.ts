import { Data } from 'effect';
import {
  MachineStatus,
  MachineTelemetry,
  TelemetryData,
} from './telemetry.schema';

export class TelemetryModel extends Data.TaggedClass('TelemetryModel')<{
  readonly data: TelemetryData;
}> {
  static create(raw: TelemetryData): MachineTelemetry {
    const status: MachineStatus =
      raw.temperature >= 90
        ? 'CRITICAL'
        : raw.temperature > 90
          ? 'WARNING'
          : 'NORMAL';

    return {
      ...raw,
      status: status,
      timestamp: new Date(),
    };
  }
}
