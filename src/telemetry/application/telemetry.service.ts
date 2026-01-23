import { Injectable } from '@nestjs/common';
import { Stream } from 'effect';
import { TelemetryListener } from '../domain/entities/core/telemetry-listener.port';
import { TelemetryData } from '../domain/entities/core/telemetry-data.interface';

@Injectable()
export class TelemetryService {
  constructor(private readonly listener: TelemetryListener) {}

  getTelemetryStream(): Stream.Stream<TelemetryData> {
    return this.listener.listen();
  }
}
