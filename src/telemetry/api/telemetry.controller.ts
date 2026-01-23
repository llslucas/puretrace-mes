import { Controller, Sse } from '@nestjs/common';
import { Stream } from 'effect';
import { Observable } from 'rxjs';
import { streamToObservable } from 'src/shared/adapters/effect-rxjs.adapter';
import { TelemetryService } from '../application/telemetry.service';
import { TelemetryData } from '../domain/entities/core/telemetry-data.interface';

@Controller('telemetry')
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Sse('stream')
  streamEvents(): Observable<MachineMessage> {
    const effectStream = this.telemetryService.getTelemetryStream();

    const mappedStream = effectStream.pipe(
      Stream.map((telemetry) => ({
        data: telemetry,
      })),
    );

    return streamToObservable(mappedStream);
  }
}

interface MachineMessage {
  data: TelemetryData;
}
