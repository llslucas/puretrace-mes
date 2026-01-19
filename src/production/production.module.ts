import { Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/database/prisma/prisma.service';
import { ProductionController } from './api/create-order.controller';
import { ProductionOrderRepository } from './domain/entities/production-order.repository';
import { PrismaProductionOrderRepository } from './infra/prisma-production-order-repository';

@Module({
  imports: [],
  controllers: [ProductionController],
  providers: [
    PrismaService,
    {
      provide: ProductionOrderRepository,
      useClass: PrismaProductionOrderRepository,
    },
  ],
})
export class ProductionModule {}
