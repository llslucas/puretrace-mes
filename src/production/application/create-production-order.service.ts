import { Effect, Context, Layer } from 'effect';
import {
  CreateProductionOrderDto,
  ProductionOrder,
} from '../domain/production-order.schema';
import { ProductionOrderModel } from '../domain/production-order.model';
import {
  ProductionOrderRepository,
  RepositoryError,
} from '../domain/production-order.repository';
import { ProductionDomainError } from '../domain/production.errors';

export class CreateProductionOrderService extends Context.Tag(
  'CreateProductionOrderService',
)<
  CreateProductionOrderService,
  {
    execute: (
      dto: CreateProductionOrderDto,
    ) => Effect.Effect<
      ProductionOrder,
      ProductionDomainError | RepositoryError
    >;
  }
>() {}

export const CreateProductionOrderLive = Layer.effect(
  CreateProductionOrderService,
  Effect.gen(function* (_) {
    const repository = yield* _(ProductionOrderRepository);

    return {
      execute: (dto) =>
        Effect.gen(function* ($) {
          const newOrder = yield* $(ProductionOrderModel.create(dto));
          const savedOrder = yield* $(repository.save(newOrder));
          return savedOrder;
        }),
    };
  }),
);
