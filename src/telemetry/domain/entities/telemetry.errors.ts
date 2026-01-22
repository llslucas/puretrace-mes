import { Data } from 'effect';

export class TelemetryDataProcessingError extends Data.TaggedClass(
  'TelemetryDataProcessingError',
)<{
  readonly step: 'JSON_PARSE' | 'SCHEMA_VALIDATION';
  readonly originalError: Error;
}> {}

export class InfraError extends Data.TaggedClass('InfraError')<{
  step: string;
  originalError: Error;
}> {}
