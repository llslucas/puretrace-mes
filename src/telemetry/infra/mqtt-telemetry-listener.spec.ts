import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import mqtt from 'mqtt';
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
      providers: [MqttTelemetryListener, ConfigService],
    }).compile();

    listener = module.get<MqttTelemetryListener>(MqttTelemetryListener);
    listener.onModuleInit();
  });

  it('should convert the payload to domain object', () => {
    const topic = 'fabrica/maquinas/MACHINE-01/telemetria';

    const telemetry = {
      machineId: 'MACHINE-01',
      temperature: 88.5,
      powerConsumption: 30,
    };

    const payload = JSON.stringify(telemetry);
    const spy = jest.fn();

    listener.listen().subscribe(spy);

    messageCallback(topic, Buffer.from(payload));

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        machineId: 'MACHINE-01',
        status: 'NORMAL',
        temperature: 88.5,
        powerConsumption: 30,
      }),
    );
  });

  it('should ignore messages with invalid schema', () => {
    const spy = jest.fn();
    listener.listen().subscribe(spy);

    const invalidPayload = {
      temperature: 50,
    };

    messageCallback('topic', Buffer.from(JSON.stringify(invalidPayload)));

    expect(spy).not.toHaveBeenCalled();
  });
});
