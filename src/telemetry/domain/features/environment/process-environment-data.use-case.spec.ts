import { Effect, Either, Option } from 'effect';
import {
  EnvironmentDataDto,
  EnvironmentDataModel,
} from '../../entities/models/environment-data.model';
import { ProcessEnvironmentDataUseCase } from './process-environment-data.use-case';
import { TelemetryDataProcessingError } from '../../entities/core/telemetry.errors';

describe('[Domain] Process environment data use case', () => {
  it('should convert the raw input into a domain entity', () => {
    return Effect.gen(function* (_) {
      const useCase = new ProcessEnvironmentDataUseCase();

      const input: EnvironmentDataDto = {
        machineId: 'MACHINE-01',
        temperature: 80.0,
        powerConsumption: 10.0,
      };

      const result = yield* Effect.either(useCase.execute(input)).pipe(
        Effect.andThen(
          Either.getOrThrowWith((e) => {
            throw e.originalError;
          }),
        ),
      );

      expect(result).toBeInstanceOf(EnvironmentDataModel);
      expect(result.type).toBe('Environment');
      expect(result.data).toEqual(
        expect.objectContaining({
          ...input,
        }),
      );
    }).pipe(Effect.runSync);
  });

  it('should reject inputs with invalid schema', () => {
    return Effect.gen(function* (_) {
      const useCase = new ProcessEnvironmentDataUseCase();

      const input = {
        machineId: 'MACHINE-01',
        temp: 70.0,
        power: 12.0,
      };

      const result = yield* Effect.either(useCase.execute(input)).pipe(
        Effect.map(Either.getLeft),
        Effect.andThen(Option.getOrThrow),
      );

      expect(result).toBeInstanceOf(TelemetryDataProcessingError);
      expect(result.step).toBe('SCHEMA_VALIDATION');
    }).pipe(Effect.runSync);
  });
});
