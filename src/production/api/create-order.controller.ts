import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UsePipes,
} from '@nestjs/common';
import { Effect } from 'effect';
import { EffectValidationPipe } from 'src/shared/pipes/effect-validation.pipe';
import {
  ProductionOrderRepository,
  ProductionOrderRepositoryTag,
} from '../domain/entities/production-order.repository';
import { CreateProductionOrderDto } from '../domain/features/create-order/create-order.dto';
import { CreateOrderUseCase } from '../domain/features/create-order/create-order.use-case';

@Controller('production')
export class ProductionController {
  constructor(private readonly repository: ProductionOrderRepository) {}

  @Post()
  @UsePipes(new EffectValidationPipe())
  async handle(@Body() body: CreateProductionOrderDto) {
    const useCase = new CreateOrderUseCase();
    const program = useCase.execute(body).pipe(
      Effect.provideService(ProductionOrderRepositoryTag, this.repository),
      Effect.mapError((e) => new BadRequestException(e)),
    );

    return await Effect.runPromise(program);
  }
}
