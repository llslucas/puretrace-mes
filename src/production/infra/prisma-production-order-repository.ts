import { Effect } from 'effect';
import { PrismaService } from 'src/shared/database/prisma/prisma.service';
import {
  ProductionOrderRepository,
  RepositoryError,
} from '../domain/entities/production-order.repository';
import { ProductionOrder } from '../domain/entities/production-order.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaProductionOrderRepository implements ProductionOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  save(order: ProductionOrder) {
    return Effect.tryPromise({
      try: () =>
        this.prisma.productionOrder.create({
          data: order,
        }),
      catch: (error) => new RepositoryError(error),
    }).pipe(Effect.map((saved) => saved as ProductionOrder));
  }

  findById(id: string) {
    return Effect.tryPromise({
      try: () => this.prisma.productionOrder.findUnique({ where: { id } }),
      catch: (error) => new RepositoryError(error),
    }).pipe(Effect.map((found) => found as ProductionOrder | null));
  }
}
