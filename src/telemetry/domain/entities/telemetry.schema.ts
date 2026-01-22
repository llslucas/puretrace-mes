import { Schema } from 'effect';

export interface MachineTelemetry {
  machineId: string;
  timestamp: Date;
  temperature: number;
  powerConsumption: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export class MqttPayload extends Schema.Class<MqttPayload>('MqttPayload')({
  machineId: Schema.String.pipe(Schema.minLength(3)),
  temperature: Schema.Number.pipe(Schema.greaterThan(0), Schema.lessThan(1000)),
  powerConsumption: Schema.Number.pipe(Schema.positive()),
}) {}
