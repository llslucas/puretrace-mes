import { Data, Schema } from 'effect';
import { TelemetryData } from '../core/telemetry-data.interface';

export type EnvironmentStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface EnvironmentData {
  machineId: string;
  timestamp: Date;
  temperature: number;
  powerConsumption: number;
  status: EnvironmentStatus;
}

export class EnvironmentDataModel
  extends Data.TaggedClass('EnvironmentDataModel')<{
    type: string;
    data: EnvironmentData;
  }>
  implements TelemetryData<EnvironmentData>
{
  static create(raw: EnvironmentDataDto): EnvironmentDataModel {
    return new EnvironmentDataModel({
      type: 'Environment',
      data: {
        ...raw,
        status: this.getStatus(raw.temperature),
        timestamp: new Date(),
      },
    });
  }

  private static getStatus(temperature: number) {
    return temperature >= 90
      ? 'CRITICAL'
      : temperature > 90
        ? 'WARNING'
        : 'NORMAL';
  }

  isCritical() {
    return this.data.status === 'CRITICAL';
  }
}

export class EnvironmentDataDto extends Schema.Class<EnvironmentDataDto>(
  'EnvironmentDataDto',
)({
  machineId: Schema.String.pipe(Schema.minLength(3)),
  temperature: Schema.Number.pipe(Schema.greaterThan(0), Schema.lessThan(1000)),
  powerConsumption: Schema.Number.pipe(Schema.positive()),
}) {}
