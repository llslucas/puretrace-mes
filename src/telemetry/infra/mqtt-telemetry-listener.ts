import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Effect, Either, Schema } from 'effect';
import mqtt from 'mqtt';
import { Observable, Subject } from 'rxjs';
import { TelemetryListener } from '../domain/telemetry-listener.port';
import { InfraError } from '../domain/telemetry.errors';
import { MachineTelemetry, MqttPayload } from '../domain/telemetry.schema';

@Injectable()
export class MqttTelemetryListener
  implements TelemetryListener, OnModuleInit, OnModuleDestroy
{
  constructor(private configService: ConfigService) {}

  private mqttClient!: mqtt.MqttClient;
  private subject = new Subject<MachineTelemetry>();

  listen(): Observable<MachineTelemetry> {
    return this.subject.asObservable();
  }

  onModuleInit() {
    const brokerUrl =
      this.configService.get<string>('MQTT_URL') || 'mqtt://localhost:1883';

    this.mqttClient = mqtt.connect(brokerUrl);

    this.mqttClient.on('connect', () => {
      Effect.runSync(Effect.log(`Conectado ao Broker MQTT: ${brokerUrl}`));
      this.mqttClient.subscribe('fabrica/maquinas/+/telemetria');
    });

    this.mqttClient.on('message', (topic, message) => {
      this.processMessage(topic, message);
    });
  }

  onModuleDestroy() {
    if (this.mqttClient) {
      this.mqttClient.end();
    }
  }

  private processMessage(topic: string, message: Buffer) {
    const program = this.parseAndValidate(topic, message);
    const safeProgram = Effect.either(program);
    const result = Effect.runSync(safeProgram);

    if (Either.isRight(result)) {
      this.subject.next(result.right);
    } else {
      const error = result.left;
      Effect.runSync(
        Effect.logError(`Falha ao processar MQTT no tópico ${topic}`).pipe(
          Effect.annotateLogs({ error }),
        ),
      );
    }
  }

  private parseAndValidate(topic: string, message: Buffer) {
    return Effect.gen(function* (_) {
      // Parse JSON
      const json = yield* _(
        Effect.try({
          try: () => JSON.parse(message.toString()) as unknown,
          catch: (e) =>
            new InfraError({ step: 'JSON_PARSE', originalError: e }),
        }),
      );

      //Validate Schema
      const rawData = yield* _(Schema.decodeUnknown(MqttPayload)(json));

      // Extract id
      const machineId = topic.split('/')[2] || rawData.machineId || 'UNKNOWN';

      //Map to Domain
      return {
        machineId: machineId,
        timestamp: new Date(),
        temperature: rawData.temperature,
        powerConsumption: rawData.powerConsumption,
        status:
          rawData.temperature > 100
            ? 'CRITICAL'
            : rawData.temperature > 90
              ? 'WARNING'
              : 'NORMAL',
      } as MachineTelemetry;
    });
  }
}
