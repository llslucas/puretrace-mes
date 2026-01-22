import { Schema } from 'effect';

export type MachineStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface MachineTelemetry {
  machineId: string;
  timestamp: Date;
  temperature: number;
  powerConsumption: number;
  status: MachineStatus;
}

export class TelemetryData extends Schema.Class<TelemetryData>('TelemetryData')(
  {
    machineId: Schema.String.pipe(Schema.minLength(3)),
    temperature: Schema.Number.pipe(
      Schema.greaterThan(0),
      Schema.lessThan(1000),
    ),
    powerConsumption: Schema.Number.pipe(Schema.positive()),
  },
) {}
