import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ProductionService } from '../application/production.service';
import * as productionOrderSchema from '../domain/entities/production-order.schema';
import { ZodValidationPipe } from 'src/shared/pipes/zod-validation.pipe';

@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Post()
  @UsePipes(
    new ZodValidationPipe(productionOrderSchema.CreateProductionOrderSchema),
  )
  async create(@Body() body: productionOrderSchema.CreateProductionOrderDto) {
    return this.productionService.createOrder(body);
  }
}
