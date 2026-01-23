import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelemetryController } from './api/telemetry.controller';
import { TelemetryService } from './application/telemetry.service';
import { TelemetryListener } from './domain/entities/core/telemetry-listener.port';
import { MachineEnvironmentHandler } from './infra/handlers/machine-environment.handler';
import { MqttTelemetryListener } from './infra/listeners/mqtt-telemetry-listener';
import { TELEMETRY_HANDLER } from './domain/entities/core/telemetry-handler.interface';
import { TelemetryPipeline } from './infra/pipelines/telemetry.pipeline';

@Module({
  imports: [ConfigModule],
  controllers: [TelemetryController],
  providers: [
    TelemetryService,
    TelemetryPipeline,
    {
      provide: TELEMETRY_HANDLER,
      useClass: MachineEnvironmentHandler,
    },
    {
      provide: TelemetryListener,
      useClass: MqttTelemetryListener,
    },
  ],
})
export class TelemetryModule {}
