import z from 'zod';

export const MachineTelemetrySchema = z.object({
  machineId: z.string(),
  timestamp: z.date(),
  temperature: z.number().min(0).max(1000),
  powerConsumption: z.number(),
  status: z.enum(['NORMAL', 'WARNING', 'CRITICAL']),
});

export type MachineTelemetry = z.infer<typeof MachineTelemetrySchema>;

export const MqttPayloadSchema = MachineTelemetrySchema.omit({
  timestamp: true,
  status: true,
});

export type MqttPayload = z.infer<typeof MqttPayloadSchema>;
