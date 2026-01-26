import { Test } from '@nestjs/testing';
import { TelemetryModule } from 'src/telemetry/telemetry.module';
import { MachineEnvironmentHandler } from './machine-environment.handler';
import { Effect, Either, Option } from 'effect';
import { EnvironmentDataModel } from 'src/telemetry/domain/entities/models/environment-data.model';
import { TelemetryDataProcessingError } from 'src/telemetry/domain/entities/core/telemetry.errors';

describe('[Infra Layer] Machine Environment Layer', () => {
  let machineEnvironmentHandler: MachineEnvironmentHandler;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TelemetryModule],
    }).compile();

    machineEnvironmentHandler = module.get(MachineEnvironmentHandler);
  });

  it('should match the topic', () => {
    const topic = 'fabrica/maquinas/MACHINE-01/environment';
    expect(machineEnvironmentHandler.match(topic)).toBe(true);
  });

  it('should convert a raw message into domain entity', () => {
    return Effect.gen(function* (_) {
      const topic = 'fabrica/maquinas/MACHINE-01/environment';

      const payload = {
        machineId: 'MACHINE-01',
        temperature: 60.0,
        powerConsumption: 5.0,
      };

      const bufferPayload = Buffer.from(JSON.stringify(payload));

      const result = yield* machineEnvironmentHandler
        .handle(topic, bufferPayload)
        .pipe(Effect.andThen(Option.getOrThrow));

      expect(result).toBeInstanceOf(EnvironmentDataModel);
      expect(result.type).toEqual('Environment');
      expect(result.data).toEqual(
        expect.objectContaining({
          ...payload,
        }),
      );
    }).pipe(Effect.runSync);
  });

  it('should reject invalid json payload', () => {
    return Effect.gen(function* (_) {
      const topic = 'fabrica/maquinas/MACHINE-01/environment';

      const bufferPayload = Buffer.from('.');

      const result = yield* Effect.either(
        machineEnvironmentHandler.handle(topic, bufferPayload),
      ).pipe(Effect.map(Either.getLeft), Effect.andThen(Option.getOrThrow));

      expect(result).toBeInstanceOf(TelemetryDataProcessingError);
      expect(result.step).toEqual('JSON_PARSE');
    }).pipe(Effect.runSync);
  });
});
