import { Effect } from 'effect';
import { ProductionOrderModel } from '../entities/production-order.model';
import { ProductionOrderRepositoryTag } from '../entities/production-order.repository';
import { CreateProductionOrderDto } from '../entities/production-order.schema';

export class CreateOrderUseCase {
  execute(input: CreateProductionOrderDto) {
    return Effect.gen(function* (_) {
      const repository = yield* _(ProductionOrderRepositoryTag);
      const orderDomainEntity = yield* _(ProductionOrderModel.create(input));

      const savedOrder = yield* _(repository.save(orderDomainEntity));

      return savedOrder;
    });
  }
}
