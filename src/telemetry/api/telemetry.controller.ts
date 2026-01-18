import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { TelemetryService } from '../application/telemetry.service';

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Sse('stream')
  streamEvents(): Observable<MessageEvent> {
    return this.telemetryService.telemetry$.pipe(
      map((data) => ({
        data: data,
        type: 'machine_update',
        id: new Date().getTime().toString(),
      })),
    );
  }
}
