import { Data } from 'effect';

export class MqttParseError extends Data.TaggedClass('MqttParseError')<{
  readonly error: unknown;
}> {}

export class MqttValidationError extends Data.TaggedClass(
  'MqttValidationError',
)<{
  readonly error: unknown;
}> {}

export class MqttProcessingError extends Data.TaggedClass(
  'MqttProcessingError',
)<{
  readonly step: 'JSON_PARSE' | 'SCHEMA_VALIDATION';
  readonly originalError: unknown;
}> {}

export class InfraError extends Data.TaggedClass('InfraError')<{
  step: string;
  originalError: unknown;
}> {}
