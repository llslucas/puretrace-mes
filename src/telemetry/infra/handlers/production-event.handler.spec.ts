import { Test } from '@nestjs/testing';
import { Effect, Either, Option, TestClock, TestContext } from 'effect';
import { TelemetryDataProcessingError } from 'src/telemetry/domain/entities/core/telemetry.errors';
import { ProductionEventDataModel } from 'src/telemetry/domain/entities/models/production-event-data.model';
import { TelemetryModule } from 'src/telemetry/telemetry.module';
import { ProductionEventHandler } from './production-event.handler';

describe('[Infra Layer] Machine Environment Layer', () => {
  let productionEventHandler: ProductionEventHandler;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TelemetryModule],
    }).compile();

    productionEventHandler = module.get(ProductionEventHandler);
  });

  it('should match the topic', () => {
    const topic = 'fabrica/maquinas/MACHINE-01/production-event';
    expect(productionEventHandler.match(topic)).toBe(true);
  });

  it('should convert the raw messages into domain entity', async () => {
    return await Effect.gen(function* (_) {
      const topic = 'fabrica/maquinas/MACHINE-01/production-event';

      const previous = JSON.stringify({
        machineId: 'MACHINE-01',
        state: 'IDLE',
        timestamp: yield* TestClock.currentTimeMillis.pipe(
          Effect.andThen((time) => new Date(time).toISOString()),
        ),
      });

      yield* _(TestClock.adjust('60 seconds'));

      const current = JSON.stringify({
        machineId: 'MACHINE-01',
        state: 'RUNNING',
        timestamp: yield* TestClock.currentTimeMillis.pipe(
          Effect.andThen((time) => new Date(time).toISOString()),
        ),
      });

      // First message

      const result1 = yield* productionEventHandler
        .handle(topic, Buffer.from(previous))
        .pipe(Effect.andThen(Option.getOrNull));

      expect(result1).toBeNull();

      // Second message

      const result2 = yield* productionEventHandler
        .handle(topic, Buffer.from(current))
        .pipe(Effect.andThen(Option.getOrThrow));

      expect(result2).toBeInstanceOf(ProductionEventDataModel);
      expect(result2.type).toEqual('ProductionEvent');
    })
      .pipe(Effect.provide(TestContext.TestContext))
      .pipe(Effect.runPromise);
  });

  it('should reject invalid json payload', () => {
    return Effect.gen(function* (_) {
      const topic = 'fabrica/maquinas/MACHINE-01/production-event';

      const bufferPayload = Buffer.from('.');

      const result = yield* Effect.either(
        productionEventHandler.handle(topic, bufferPayload),
      ).pipe(Effect.map(Either.getLeft), Effect.andThen(Option.getOrThrow));

      expect(result).toBeInstanceOf(TelemetryDataProcessingError);
      expect(result.step).toEqual('JSON_PARSE');
    }).pipe(Effect.runSync);
  });
});
