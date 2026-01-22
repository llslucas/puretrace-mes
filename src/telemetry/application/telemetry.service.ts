import { Injectable } from '@nestjs/common';
import { TelemetryListener } from '../domain/entities/telemetry-listener.port';
import { Stream } from 'effect';
import { MachineTelemetry } from '../domain/entities/telemetry.schema';

@Injectable()
export class TelemetryService {
  constructor(private readonly listener: TelemetryListener) {}

  getTelemetryStream(): Stream.Stream<MachineTelemetry> {
    return this.listener.listen();
  }
}
