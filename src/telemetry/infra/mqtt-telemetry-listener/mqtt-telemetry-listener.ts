import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Effect, Fiber, PubSub, Queue, Stream } from 'effect';
import { RuntimeFiber } from 'effect/Fiber';
import mqtt from 'mqtt';
import { TelemetryListener } from '../../domain/entities/telemetry-listener.port';
import { MachineTelemetry } from '../../domain/entities/telemetry.schema';
import { RawMessage, TelemetryPipeline } from '../pipelines/telemetry.pipeline';

@Injectable()
export class MqttTelemetryListener
  implements TelemetryListener, OnModuleInit, OnModuleDestroy
{
  constructor(
    private readonly configService: ConfigService,
    private readonly pipeline: TelemetryPipeline,
  ) {}

  listen(): Stream.Stream<MachineTelemetry> {
    if (!this.telemetryPubSub) return Stream.empty;
    return Stream.fromPubSub(this.telemetryPubSub);
  }

  private mqttClient: mqtt.MqttClient | null = null;
  private processingQueue: Queue.Queue<RawMessage> | null = null;
  private telemetryPubSub: PubSub.PubSub<MachineTelemetry> | null = null;
  private pipelineFiber: RuntimeFiber<any, any> | null = null;

  async onModuleInit() {
    this.processingQueue = await Effect.runPromise(Queue.sliding(1000));
    this.telemetryPubSub = await Effect.runPromise(PubSub.sliding(200));

    const brokerUrl =
      this.configService.get<string>('MQTT_URL') || 'mqtt://localhost:1883';

    this.mqttClient = mqtt.connect(brokerUrl);

    this.mqttClient.on('connect', () => {
      Effect.runSync(Effect.log(`Conectado ao Broker MQTT: ${brokerUrl}`));
      this.mqttClient?.subscribe('fabrica/maquinas/+/+');
    });

    this.mqttClient.on('message', (topic, payload) => {
      const msg = { topic, payload };

      if (this.processingQueue) {
        Effect.runSync(Queue.offer(this.processingQueue, msg));
      }
    });

    this.startPipeLine();
  }

  async onModuleDestroy() {
    if (this.pipelineFiber) {
      await Effect.runPromise(Fiber.interrupt(this.pipelineFiber));
    }

    if (this.processingQueue)
      await Effect.runPromise(Queue.shutdown(this.processingQueue));

    if (this.telemetryPubSub)
      await Effect.runPromise(PubSub.shutdown(this.telemetryPubSub));

    if (this.mqttClient) {
      this.mqttClient.end();
    }
  }

  private startPipeLine() {
    if (!this.processingQueue || !this.telemetryPubSub) return;

    const queueStream = Stream.fromQueue(this.processingQueue);

    const program = this.pipeline.build(queueStream, this.telemetryPubSub);

    this.pipelineFiber = Effect.runFork(program);

    console.log('Pipeline de Telemetria Iniciada');
  }
}
