import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UsePipes,
} from '@nestjs/common';
import { Effect, Either } from 'effect';
import { ZodValidationPipe } from 'src/shared/pipes/zod-validation.pipe';
import {
  ProductionOrderRepository,
  ProductionOrderRepositoryTag,
} from '../domain/entities/production-order.repository';
import * as createOrderDto from '../domain/features/create-order/create-order.dto';
import { CreateOrderUseCase } from '../domain/features/create-order/create-order.use-case';

@Controller('production')
export class ProductionController {
  constructor(private readonly repository: ProductionOrderRepository) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createOrderDto.CreateProductionOrderSchema))
  async handle(@Body() body: createOrderDto.CreateProductionOrderDto) {
    const useCase = new CreateOrderUseCase();
    const program = useCase.execute(body);
    const safeProgram = Effect.either(program);

    const runnable = safeProgram.pipe(
      Effect.provideService(ProductionOrderRepositoryTag, this.repository),
    );

    const result = await Effect.runPromise(runnable);

    if (Either.isRight(result)) {
      return result.right;
    } else {
      throw new BadRequestException(result.left);
    }
  }
}
