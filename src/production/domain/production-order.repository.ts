import { Context, Effect } from 'effect';
import { ProductionOrder } from './production-order.schema';

export class RepositoryError {
  readonly _tag = 'RepositoryError';
  constructor(readonly error: unknown) {}
}

// Interface funcional do Repositório
export class ProductionOrderRepository extends Context.Tag(
  'ProductionOrderRepository',
)<
  ProductionOrderRepository,
  {
    save: (
      order: ProductionOrder,
    ) => Effect.Effect<ProductionOrder, RepositoryError>;
    findById: (
      id: string,
    ) => Effect.Effect<ProductionOrder | null, RepositoryError>;
  }
>() {}
