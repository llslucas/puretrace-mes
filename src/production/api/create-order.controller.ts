import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UsePipes,
} from '@nestjs/common';
import { Effect, Either } from 'effect';
import { EffectValidationPipe } from 'src/shared/pipes/effect-validation.pipe';
import {
  ProductionOrderRepository,
  ProductionOrderRepositoryTag,
} from '../domain/entities/production-order.repository';
import { CreateOrderUseCase } from '../domain/features/create-order/create-order.use-case';
import { CreateProductionOrderDto } from '../domain/features/create-order/create-order.dto';

@Controller('production')
export class ProductionController {
  constructor(private readonly repository: ProductionOrderRepository) {}

  @Post()
  @UsePipes(new EffectValidationPipe())
  async handle(@Body() body: CreateProductionOrderDto) {
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
