import { Module } from '@nestjs/common';
import { ProductionModule } from './production/production.module';

@Module({
  imports: [ProductionModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
