import { Effect, Schema } from 'effect';
import { ProductionOrderModel } from '../../entities/production-order.model';
import { ProductionOrderRepositoryTag } from '../../entities/production-order.repository';
import { CreateProductionOrderDto } from './create-order.dto';

export class CreateOrderUseCase {
  execute(input: CreateProductionOrderDto) {
    return Effect.gen(function* (_) {
      const dto = yield* _(
        Schema.decodeUnknown(CreateProductionOrderDto)(input),
      );

      const repository = yield* _(ProductionOrderRepositoryTag);
      const orderDomainEntity = yield* _(ProductionOrderModel.create(dto));

      const savedOrder = yield* _(repository.save(orderDomainEntity));

      return savedOrder;
    });
  }
}
