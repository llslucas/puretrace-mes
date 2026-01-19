import { Schema } from 'effect';

export class MachineTelemetry extends Schema.Class<MachineTelemetry>(
  'MachineTelemetry',
)({
  machineId: Schema.String.pipe(Schema.minLength(3)),
  timestamp: Schema.Date,
  temperature: Schema.Number.pipe(Schema.greaterThan(0), Schema.lessThan(1000)),
  powerConsumption: Schema.Number.pipe(Schema.positive()),
  status: Schema.Literal('NORMAL', 'WARNING', 'CRITICAL'),
}) {}

export class MqttPayload extends Schema.Class<MqttPayload>('MqttPayload')({
  machineId: Schema.String.pipe(Schema.minLength(3)),
  temperature: Schema.Number.pipe(Schema.greaterThan(0), Schema.lessThan(1000)),
  powerConsumption: Schema.Number.pipe(Schema.positive()),
}) {}
