import { Injectable } from '@nestjs/common';
import {
  ProductionOrderRepository,
  ProductionOrderRepositoryTag,
} from '../domain/entities/production-order.repository';
import { CreateProductionOrderDto } from '../domain/entities/production-order.schema';
import { CreateOrderUseCase } from '../domain/use-cases/create-order.use-case';
import { Effect } from 'effect';

@Injectable()
export class ProductionService {
  constructor(private readonly repository: ProductionOrderRepository) {}

  async createOrder(input: CreateProductionOrderDto) {
    const useCase = new CreateOrderUseCase();
    const program = useCase.execute(input);

    const runnable = program.pipe(
      Effect.provideService(ProductionOrderRepositoryTag, this.repository),
    );

    return await Effect.runPromise(runnable);
  }
}
