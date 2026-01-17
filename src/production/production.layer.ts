import { Layer } from 'effect';
import { CreateProductionOrderLive } from './application/create-production-order.service';
import { InMemoryProductionOrderRepositoryLive } from './infra/in-memory-repository';

export const ProductionRuntimeLayer = CreateProductionOrderLive.pipe(
  Layer.provide(InMemoryProductionOrderRepositoryLive),
);
