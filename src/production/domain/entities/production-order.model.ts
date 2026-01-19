import { Effect } from 'effect';
import { ProductionOrder } from './production-order.schema';
import { randomUUID } from 'node:crypto';
import { InvalidWasteLimitError } from './production.errors';
import { CreateProductionOrderDto } from '../features/create-order/create-order.dto';

export const ProductionOrderModel = {
  create: (
    dto: CreateProductionOrderDto,
  ): Effect.Effect<ProductionOrder, InvalidWasteLimitError> => {
    return Effect.gen(function* (_) {
      const maxAllowedWaste = dto.quantity * 0.1;

      if (dto.wasteLimitInKg > maxAllowedWaste) {
        yield* _(
          Effect.fail(
            new InvalidWasteLimitError({
              message: `O limite de desperdício excede 10% da produção. Isto viola a política de sustentabilidade.`,
              limit: maxAllowedWaste,
              actual: dto.wasteLimitInKg,
            }),
          ),
        );
      }

      return {
        ...dto,
        id: randomUUID(),
        status: 'DRAFT',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });
  },

  startProduction: (
    order: ProductionOrder,
  ): Effect.Effect<ProductionOrder, Error> => {
    if (order.status !== 'PENDING') {
      return Effect.fail(
        new Error('Apenas ordens PENDING podem ser iniciadas.'),
      );
    }
    return Effect.succeed({
      ...order,
      status: 'IN_PROGRESS',
      updatedAt: new Date(),
    });
  },
};
