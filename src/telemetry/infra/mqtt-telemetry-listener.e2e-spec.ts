import mqtt from 'mqtt';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { firstValueFrom } from 'rxjs';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import { MqttTelemetryListener } from './mqtt-telemetry-listener';

describe('[E2E] Telemetry', () => {
  let listener: MqttTelemetryListener;
  let container: StartedTestContainer;
  let brokerUrl: string;
  let publisherClient: mqtt.MqttClient;

  beforeAll(async () => {
    container = await new GenericContainer('eclipse-mosquitto:2')
      .withExposedPorts(1883)
      .withCommand(['mosquitto', '-c', '/mosquitto-no-auth.conf'])
      .withCopyContentToContainer([
        {
          content: 'listener 1883\nallow_anonymous true ',
          target: '/mosquitto-no-auth.conf',
        },
      ])
      .withWaitStrategy(Wait.forLogMessage('mosquitto version 2', 1))
      .start();

    const port = container.getMappedPort(1883);
    const host = container.getHost();
    brokerUrl = `mqtt://${host}:${port}`;
  }, 60000);

  afterAll(async () => {
    if (publisherClient) publisherClient.end(true);
    if (container) await container.stop();
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MqttTelemetryListener,
        {
          provide: ConfigService,
          useValue: { get: () => brokerUrl },
        },
      ],
    }).compile();

    listener = module.get<MqttTelemetryListener>(MqttTelemetryListener);
    listener.onModuleInit();

    publisherClient = mqtt.connect(brokerUrl);
    await new Promise((resolve) => publisherClient.on('connect', resolve));

    //Delay para correção de race condition
    await new Promise((r) => setTimeout(r, 500));
  });

  afterEach(() => {
    listener.onModuleDestroy();
  });

  it('should connect, receive the message and process.', async () => {
    const topic = 'fabrica/maquinas/MACHINE-01/telemetria';
    const payload = JSON.stringify({
      machineId: 'MACHINE-01',
      temperature: 50,
      powerConsumption: 10,
    });

    const dataPromise = firstValueFrom(listener.listen());

    publisherClient.publish(topic, payload, { qos: 1 });

    const result = await dataPromise;
    expect(result).toMatchObject({
      machineId: 'MACHINE-01',
      temperature: 50,
      powerConsumption: 10,
    });
  }, 10000);
});
