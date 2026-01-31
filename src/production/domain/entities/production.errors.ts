import { Data } from 'effect';

export class InvalidWasteLimitError extends Data.TaggedError(
  'InvalidWasteLimitError',
)<{
  readonly message: string;
  readonly limit: number;
  readonly actual: number;
}> {}

export class ProductionStatusError extends Data.TaggedError(
  'ProductionStatusError',
)<{
  readonly message: string;
  readonly currentStatus: string;
}> {}

export type ProductionDomainError =
  | InvalidWasteLimitError
  | ProductionStatusError;
