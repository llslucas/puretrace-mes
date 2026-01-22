import { Data } from 'effect';

export class MqttProcessingError extends Data.TaggedClass(
  'MqttProcessingError',
)<{
  readonly step: 'JSON_PARSE' | 'SCHEMA_VALIDATION';
  readonly originalError: Error;
}> {}

export class InfraError extends Data.TaggedClass('InfraError')<{
  step: string;
  originalError: Error;
}> {}
