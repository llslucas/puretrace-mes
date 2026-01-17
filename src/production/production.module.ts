import { Module } from '@nestjs/common';
import { ProductionController } from './api/production.controller';

@Module({
  imports: [],
  controllers: [ProductionController],
  providers: [],
})
export class ProductionModule {}
