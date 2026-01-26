import { Injectable } from '@nestjs/common';
import { Effect } from 'effect';
import {
  ProductionOrderRepository,
  RepositoryError,
} from 'src/production/domain/entities/production-order.repository';
import { ProductionOrder } from 'src/production/domain/entities/production-order.schema';

@Injectable()
export class InMemoryProductionOrderRepository implements ProductionOrderRepository {
  private readonly db = new Map<string, ProductionOrder>();

  save(
    order: ProductionOrder,
  ): Effect.Effect<ProductionOrder, RepositoryError> {
    return Effect.sync(() => {
      this.db.set(order.id, order);
      return order;
    });
  }

  findById(id: string): Effect.Effect<ProductionOrder | null, RepositoryError> {
    return Effect.sync(() => {
      return this.db.get(id) || null;
    });
  }

  clear() {
    this.db.clear();
  }
}
