import { Effect, Either } from 'effect';
import { ProductionOrderModel } from './production-order.model';
import { InvalidWasteLimitError } from './production.errors';
import { CreateProductionOrderDto } from '../features/create-order/create-order.dto';

describe('ProductionOrderModel', () => {
  it('should create a valid production order when the waste is below the limit', () => {
    const validInput: CreateProductionOrderDto = {
      productName: 'Peça X1',
      quantity: 1000,
      wasteLimitInKg: 50,
    };

    const program = ProductionOrderModel.create(validInput);
    const safeProgram = Effect.either(program);

    const result = Effect.runSync(safeProgram);

    expect(Either.isRight(result));

    if (Either.isRight(result)) {
      expect(result.right).toEqual(
        expect.objectContaining({
          id: expect.stringMatching(
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i,
          ) as string,
          status: 'DRAFT',
          wasteLimitInKg: 50,
        }),
      );
    }
  });

  it('should return a domain error if the waste exceeds the limit', () => {
    const invalidInput: CreateProductionOrderDto = {
      productName: 'Peça X1',
      quantity: 1000,
      wasteLimitInKg: 150,
    };

    const program = ProductionOrderModel.create(invalidInput);
    const safeProgram = Effect.either(program);

    const result = Effect.runSync(safeProgram);

    expect(Either.isLeft(result)).toBe(true);

    if (Either.isLeft(result)) {
      expect(result.left).toBeInstanceOf(InvalidWasteLimitError);
      expect(result.left.message).toContain(
        'Isto viola a política de sustentabilidade',
      );
    }
  });
});
