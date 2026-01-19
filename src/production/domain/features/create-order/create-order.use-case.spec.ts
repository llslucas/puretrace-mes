import { Effect, Either } from 'effect';
import { InMemoryProductionOrderRepository } from '../../../infra/in-memory-production-order-repository';
import { ProductionOrderRepositoryTag } from '../../entities/production-order.repository';
import { CreateProductionOrderDto } from './create-order.dto';
import { CreateOrderUseCase } from './create-order.use-case';

describe('[Use Case] Create Production Order', () => {
  it('should create a production order with a valid input', async () => {
    const validInput: CreateProductionOrderDto = {
      productName: 'Peça X1',
      quantity: 1000,
      wasteLimitInKg: 50,
    };

    const repository = new InMemoryProductionOrderRepository();

    const useCase = new CreateOrderUseCase();
    const program = useCase.execute(validInput);
    const safeProgram = Effect.either(program);

    const runnable = safeProgram.pipe(
      Effect.provideService(ProductionOrderRepositoryTag, repository),
    );

    const result = await Effect.runPromise(runnable);

    expect(Either.isRight(result)).toBe(true);

    if (Either.isRight(result)) {
      expect(result.right).toEqual(
        expect.objectContaining({
          productName: validInput.productName,
          quantity: validInput.quantity,
          wasteLimitInKg: validInput.wasteLimitInKg,
        }),
      );
    }
  });
});
