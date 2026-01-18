import { Observable } from 'rxjs';
import { MachineTelemetry } from './telemetry.schema';

export abstract class TelemetryListener {
  abstract listen(): Observable<MachineTelemetry>;
}
