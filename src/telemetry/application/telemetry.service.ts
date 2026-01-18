import { Injectable } from '@nestjs/common';
import { Observable, share } from 'rxjs';
import { TelemetryListener } from '../domain/telemetry-listener.port';
import { MachineTelemetry } from '../domain/telemetry.schema';

@Injectable()
export class TelemetryService {
  public telemetry$: Observable<MachineTelemetry>;

  constructor(private readonly listener: TelemetryListener) {
    this.telemetry$ = this.listener.listen().pipe(share());
  }
}
