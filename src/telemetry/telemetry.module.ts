import { Module } from '@nestjs/common';
import { TelemetryController } from './api/telemetry.controller';
import { TelemetryService } from './application/telemetry.service';
import { TelemetryListener } from './domain/entities/telemetry-listener.port';
import { MqttTelemetryListener } from './infra/mqtt-telemetry-listener';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [TelemetryController],
  providers: [
    TelemetryService,
    {
      provide: TelemetryListener,
      useClass: MqttTelemetryListener,
    },
  ],
})
export class TelemetryModule {}
