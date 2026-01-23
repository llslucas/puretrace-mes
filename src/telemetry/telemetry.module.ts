import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelemetryController } from './api/telemetry.controller';
import { TelemetryService } from './application/telemetry.service';
import { TELEMETRY_HANDLER } from './domain/entities/core/telemetry-handler.interface';
import { TelemetryListener } from './domain/entities/core/telemetry-listener.port';
import { MachineEnvironmentHandler } from './infra/handlers/machine-environment.handler';
import { MqttTelemetryListener } from './infra/listeners/mqtt-telemetry-listener';
import { TelemetryPipeline } from './infra/pipelines/telemetry.pipeline';
import { ProductionEventHandler } from './infra/handlers/production-event.handler';

@Module({
  imports: [ConfigModule],
  controllers: [TelemetryController],
  providers: [
    TelemetryService,
    TelemetryPipeline,
    {
      provide: TelemetryListener,
      useClass: MqttTelemetryListener,
    },
    MachineEnvironmentHandler,
    ProductionEventHandler,
    {
      provide: TELEMETRY_HANDLER,
      useFactory: (
        machineEnvironmentHandler: MachineEnvironmentHandler,
        productionEventHandler: ProductionEventHandler,
      ) => {
        return [machineEnvironmentHandler, productionEventHandler];
      },
      inject: [MachineEnvironmentHandler, ProductionEventHandler],
    },
  ],
})
export class TelemetryModule {}
