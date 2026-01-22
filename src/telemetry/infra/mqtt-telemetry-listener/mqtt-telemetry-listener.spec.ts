import mqtt from 'mqtt';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Effect, Option, Stream } from 'effect';
import { TELEMETRY_HANDLER } from '../handlers/telemetry-handler.interface';
import { MachineEnvironmentHandler } from '../handlers/machine-environment.handler';
import { TelemetryListener } from '../../domain/entities/telemetry-listener.port';
import { MqttTelemetryListener } from './mqtt-telemetry-listener';

jest.mock('mqtt');

describe('[Infra Layer] MqttTelemetryListener', () => {
  let listener: MqttTelemetryListener;
  let mqttClientMock: any;
  let messageCallback: (topic: string, message: Buffer) => void;

  beforeEach(async () => {
    mqttClientMock = {
      on: jest
        .fn()
        .mockImplementation((event: string, callback: () => void) => {
          if (event === 'message') messageCallback = callback;
        }),
      subscribe: jest.fn(),
      end: jest.fn(),
    };

    (mqtt.connect as jest.Mock).mockReturnValue(mqttClientMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        {
          provide: TELEMETRY_HANDLER,
          useClass: MachineEnvironmentHandler,
        },
        {
          provide: TelemetryListener,
          useClass: MqttTelemetryListener,
        },
      ],
    }).compile();

    listener = module.get<MqttTelemetryListener>(TelemetryListener);
    await listener.onModuleInit();
  });

  it('should convert the payload to domain object', async () => {
    const effectStream = listener.listen();

    const topic = 'fabrica/maquinas/MACHINE-01/telemetria';

    const telemetry = {
      machineId: 'MACHINE-01',
      temperature: 88.5,
      powerConsumption: 30,
    };

    const payload = JSON.stringify(telemetry);

    messageCallback(topic, Buffer.from(payload));

    const result = await Stream.runHead(effectStream).pipe(Effect.runPromise);

    expect(Option.isSome(result)).toBe(true);

    if (Option.isSome(result)) {
      expect(result.value).toMatchObject(telemetry);
    }
  });

  it('should ignore messages with invalid schema', async () => {
    const effectStream = listener.listen();

    const invalidPayload = {
      temperature: 50,
    };

    const validPayload = {
      machineId: 'MACHINE-01',
      temperature: 88.5,
      powerConsumption: 30,
    };

    messageCallback('topic', Buffer.from(JSON.stringify(invalidPayload)));

    await new Promise((r) => setTimeout(r, 50));

    messageCallback('topic', Buffer.from(JSON.stringify(validPayload)));

    const result = await Stream.runHead(effectStream).pipe(Effect.runPromise);

    // O primeiro payload inválido será ignorado e apenas o segundo será exibido
    expect(Option.isSome(result)).toBe(true);

    if (Option.isSome(result)) {
      expect(result.value).toMatchObject(validPayload);
    }
  });
});
