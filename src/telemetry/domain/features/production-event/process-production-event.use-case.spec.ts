import { Effect, Either, Option, TestClock, TestContext } from 'effect';
import { ProductionEventDataModel } from '../../entities/models/production-event-data.model';
import { ProcessProductionEventUseCase } from './process-production-event.use-case';
import { TelemetryDataProcessingError } from '../../entities/core/telemetry.errors';

describe('[Domain] Process production event use case', () => {
  it('should convert raw input into domain entity', async () => {
    return Effect.gen(function* (_) {
      const useCase = new ProcessProductionEventUseCase();

      yield* _(TestClock.setTime(new Date()));

      const previous = {
        machineId: 'MACHINE-01',
        state: 'IDLE',
        timestamp: yield* TestClock.currentTimeMillis.pipe(
          Effect.andThen((time) => new Date(time).toISOString()),
        ),
      };

      yield* _(TestClock.adjust('60 seconds'));

      const current = {
        machineId: 'MACHINE-01',
        state: 'RUNNING',
        timestamp: yield* TestClock.currentTimeMillis.pipe(
          Effect.andThen((time) => new Date(time).toISOString()),
        ),
      };

      const result = yield* Effect.either(
        useCase.execute([previous, current]),
      ).pipe(
        Effect.andThen(
          Either.getOrThrowWith((e) => {
            throw e.originalError;
          }),
        ),
      );

      expect(result).toBeInstanceOf(ProductionEventDataModel);
      expect(result).toEqual(
        expect.objectContaining({
          type: 'ProductionEvent',
          data: {
            machineId: current.machineId,
            state: previous.state,
            newState: current.state,
            startTime: new Date(previous.timestamp),
            endTime: new Date(current.timestamp),
            durationSeconds: 60,
          },
        }),
      );
    }).pipe(Effect.provide(TestContext.TestContext), Effect.runPromise);
  });

  it('should reject inputs with invalid schema', () => {
    return Effect.gen(function* (_) {
      const useCase = new ProcessProductionEventUseCase();

      const previous = {
        id: 'MACHINE-01',
        state: 'IDLE',
        timestamp: '01/01/2026',
      };

      const current = {
        machineId: 'MACHINE-01',
        state: 'RUNNING',
        timestamp: '01/01/2026',
      };

      const result = yield* Effect.either(
        useCase.execute([previous, current]),
      ).pipe(Effect.map(Either.getLeft), Effect.andThen(Option.getOrThrow));

      expect(result).toBeInstanceOf(TelemetryDataProcessingError);
      expect(result.step).toBe('SCHEMA_VALIDATION');
    }).pipe(Effect.runSync);
  });
});
