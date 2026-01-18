import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UsePipes,
} from '@nestjs/common';
import { Effect, Either, ManagedRuntime } from 'effect';
import { CreateProductionOrderService } from '../application/create-production-order.service';
import * as productionOrderSchema from '../domain/production-order.schema';
import { InvalidWasteLimitError } from '../domain/production.errors';
import { ProductionRuntimeLayer } from '../production.layer';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';

@Controller('production')
export class ProductionController {
  private readonly runtime = ManagedRuntime.make(ProductionRuntimeLayer);

  @Post()
  @UsePipes(
    new ZodValidationPipe(productionOrderSchema.CreateProductionOrderSchema),
  )
  async create(@Body() dto: productionOrderSchema.CreateProductionOrderDto) {
    const program = Effect.gen(function* (_) {
      const service = yield* _(CreateProductionOrderService);
      return yield* _(service.execute(dto));
    });

    const safeProgram = Effect.either(program);

    const result = await this.runtime.runPromise(safeProgram);

    if (Either.isRight(result)) {
      return result.right;
    } else {
      const error = result.left;

      if (error instanceof InvalidWasteLimitError) {
        throw new BadRequestException({
          message: error.message,
          limit: error.limit,
          actual: error.actual,
          code: 'WASTE_LIMIT_EXCEEDED',
        });
      }

      throw new InternalServerErrorException('Erro inesperado na produção');
    }
  }
}
