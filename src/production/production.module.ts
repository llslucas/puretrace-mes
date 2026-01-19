import { Module } from '@nestjs/common';
import { ProductionController } from './api/production.controller';
import { ProductionService } from './application/production.service';
import { ProductionOrderRepository } from './domain/entities/production-order.repository';
import { PrismaProductionOrderRepository } from './infra/prisma-production-order-repository';
import { PrismaService } from 'src/shared/database/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [ProductionController],
  providers: [
    ProductionService,
    PrismaService,
    {
      provide: ProductionOrderRepository,
      useClass: PrismaProductionOrderRepository,
    },
  ],
})
export class ProductionModule {}
