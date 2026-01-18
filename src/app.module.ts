import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductionModule } from './production/production.module';
import { TelemetryModule } from './telemetry/telemetry.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    ProductionModule,
    TelemetryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
