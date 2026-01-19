import { Context, Effect } from 'effect';
import { ProductionOrder } from './production-order.schema';

export class RepositoryError {
  readonly _tag = 'RepositoryError';
  constructor(readonly error: unknown) {}
}

//Interface funcional do Effect
export class ProductionOrderRepositoryTag extends Context.Tag(
  'ProductionOrderRepositoryTag',
)<ProductionOrderRepositoryTag, ProductionOrderRepository>() {}

export abstract class ProductionOrderRepository {
  abstract save: (
    order: ProductionOrder,
  ) => Effect.Effect<ProductionOrder, RepositoryError>;
  abstract findById: (
    id: string,
  ) => Effect.Effect<ProductionOrder | null, RepositoryError>;
}
