import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventSource } from 'eventsource';
import mqtt from 'mqtt';
import { MosquittoContainerFactory } from 'test/factories/containers/mosquitto-container';
import { StartedTestContainer } from 'testcontainers';
import { TelemetryData } from '../domain/entities/core/telemetry-data.interface';
import { TelemetryModule } from '../telemetry.module';

describe('[E2E] Telemetry Controller', () => {
  let app: INestApplication;
  let url: string;
  let container: StartedTestContainer;
  let brokerUrl: string;
  let publisherClient: mqtt.MqttClient;

  beforeAll(async () => {
    container = await MosquittoContainerFactory.create();

    const port = container.getMappedPort(1883);
    const host = container.getHost();
    brokerUrl = `mqtt://${host}:${port}`;

    process.env.MQTT_URL = brokerUrl;

    const module: TestingModule = await Test.createTestingModule({
      imports: [TelemetryModule],
    }).compile();

    app = module.createNestApplication();
    await app.listen(0);
    url = await app.getUrl();

    publisherClient = mqtt.connect(brokerUrl);
    await new Promise((resolve) => publisherClient.on('connect', resolve));

    //Delay para correção de race condition
    await new Promise((r) => setTimeout(r, 500));
  }, 60000);

  afterAll(async () => {
    await app.close();
    await container.stop();
    publisherClient.end(true);
  });

  it('should stream telemetry events via SSE when the broker receive messages ', (done) => {
    const eventSource = new EventSource(`${url}/telemetry/stream`);

    let receivedCount = 0;

    eventSource.addEventListener('open', () => {
      // Publica a mensagem no broker mqtt 500ms após a contexão bem sucedida
      setTimeout(() => {
        const topic = 'fabrica/maquinas/MACHINE-01/environment';
        const payload = JSON.stringify({
          machineId: 'MACHINE-01',
          temperature: 50,
          powerConsumption: 10,
        });

        publisherClient.publish(topic, payload, { qos: 1 });
      }, 500);
    });

    eventSource.addEventListener('message', (event: MessageEvent<string>) => {
      const result = JSON.parse(event.data) as TelemetryData;
      receivedCount++;

      expect(receivedCount).toBe(1);
      expect(result.type).toBe('Environment');
      expect(result.data).toEqual(
        expect.objectContaining({
          machineId: 'MACHINE-01',
          temperature: 50,
          powerConsumption: 10,
        }),
      );

      if (receivedCount > 0) {
        eventSource.close();
        done();
      }
    });

    eventSource.addEventListener('error', (error) => {
      if (error) {
        eventSource.close();
        done(error);
      }
    });
  }, 10000);
});
