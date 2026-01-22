import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Effect, Queue, Schema, Stream } from 'effect';
import mqtt from 'mqtt';
import { TelemetryListener } from '../domain/entities/telemetry-listener.port';
import { MqttProcessingError } from '../domain/entities/telemetry.errors';
import {
  MachineTelemetry,
  MqttPayload,
} from '../domain/entities/telemetry.schema';

interface RawMessage {
  topic: string;
  payload: Buffer;
}

@Injectable()
export class MqttTelemetryListener
  implements TelemetryListener, OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {}

  private mqttClient: mqtt.MqttClient | null = null;
  private queue: Queue.Queue<RawMessage> | null = null;

  listen(): Stream.Stream<MachineTelemetry> {
    if (!this.queue) return Stream.empty;

    return Stream.fromQueue(this.queue).pipe(
      Stream.mapEffect((msg) => {
        return this.messageParser(msg.topic, msg.payload).pipe(
          Effect.catchAll((error) => {
            return Effect.as(
              Effect.log(
                ` ⚠️ Mensagem descartada: Erro [${error.step}] ${error.originalError.message}`,
              ),
              null,
            );
          }),
        );
      }),
      Stream.filter((item): item is MachineTelemetry => item !== null),
    );
  }

  async onModuleInit() {
    this.queue = await Effect.runPromise(Queue.sliding<RawMessage>(1000));

    const brokerUrl =
      this.configService.get<string>('MQTT_URL') || 'mqtt://localhost:1883';

    this.mqttClient = mqtt.connect(brokerUrl);

    this.mqttClient.on('connect', () => {
      Effect.runSync(Effect.log(`Conectado ao Broker MQTT: ${brokerUrl}`));
      this.mqttClient?.subscribe('fabrica/maquinas/+/telemetria');
    });

    this.mqttClient.on('message', (topic, payload) => {
      if (this.queue) {
        Effect.runSync(Queue.offer(this.queue, { topic, payload }));
      }
    });
  }

  onModuleDestroy() {
    if (this.mqttClient) {
      this.mqttClient.end();
    }

    if (this.queue) {
      Effect.runSync(Queue.shutdown(this.queue));
    }
  }

  private messageParser(topic: string, message: Buffer) {
    return Effect.gen(function* (_) {
      // Parse JSON
      const json = yield* _(
        Effect.try({
          try: () => JSON.parse(message.toString()) as unknown,
          catch: (e) =>
            new MqttProcessingError({
              step: 'JSON_PARSE',
              originalError: e as SyntaxError,
            }),
        }),
      );

      //Validate Schema
      const rawData = yield* _(
        Schema.decodeUnknown(MqttPayload)(json).pipe(
          Effect.mapError((e) => {
            return new MqttProcessingError({
              step: 'SCHEMA_VALIDATION',
              originalError: e,
            });
          }),
        ),
      );

      const machineId = topic.split('/')[2] || rawData.machineId || 'UNKNOWN';
      const status =
        rawData.temperature > 100
          ? 'CRITICAL'
          : rawData.temperature > 90
            ? 'WARNING'
            : 'NORMAL';

      return {
        machineId: machineId,
        timestamp: new Date(),
        temperature: rawData.temperature,
        powerConsumption: rawData.powerConsumption,
        status: status,
      } as MachineTelemetry;
    });
  }
}
