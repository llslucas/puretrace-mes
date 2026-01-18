import { Test, TestingModule } from '@nestjs/testing';
import { Subject } from 'rxjs';
import { TelemetryListener } from '../domain/telemetry-listener.port';
import { MachineTelemetry } from '../domain/telemetry.schema';
import { TelemetryService } from './telemetry.service';

jest.mock('mqtt');

describe('[Application Layer] TelemetryService', () => {
  let service: TelemetryService;

  const mockSubject = new Subject<MachineTelemetry>();

  const mockListener = {
    listen: jest.fn().mockReturnValue(mockSubject.asObservable()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelemetryService,
        { provide: TelemetryListener, useValue: mockListener },
      ],
    }).compile();

    service = module.get<TelemetryService>(TelemetryService);
  });

  it('should pass the data received from listener', () => {
    const mockData: MachineTelemetry = {
      machineId: 'MACHINE-01',
      temperature: 100,
      powerConsumption: 50,
      status: 'CRITICAL',
      timestamp: new Date(),
    };

    const spy = jest.fn();
    service.telemetry$.subscribe(spy);

    mockSubject.next(mockData);
    expect(spy).toHaveBeenCalledWith(mockData);
  });
});
