import { Data } from 'effect';

export class TelemetryDataProcessingError extends Data.TaggedError(
  'TelemetryDataProcessingError',
)<{
  readonly step: 'JSON_PARSE' | 'SCHEMA_VALIDATION';
  readonly originalError: Error;
}> {}

export class InfraError extends Data.TaggedError('InfraError')<{
  step: string;
  originalError: Error;
}> {}
