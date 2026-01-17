import { Effect, Layer, Ref } from 'effect';
import {
  ProductionOrderRepository,
  RepositoryError,
} from '../domain/production-order.repository';
import { ProductionOrder } from '../domain/production-order.schema';

export const InMemoryProductionOrderRepositoryLive = Layer.effect(
  ProductionOrderRepository,
  Effect.gen(function* (_) {
    const store = yield* _(Ref.make<ProductionOrder[]>([]));

    return {
      save: (order) =>
        Ref.updateAndGet(store, (list) => [...list, order]).pipe(
          Effect.map(() => order),
          Effect.mapError((e) => new RepositoryError(e)),
        ),
      findById: (id) =>
        Ref.get(store).pipe(
          Effect.map((list) => list.find((o) => o.id === id) || null),
          Effect.mapError((e) => new RepositoryError(e)),
        ),
    };
  }),
);
