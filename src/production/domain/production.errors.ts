import { Data } from 'effect';

export class InvalidWasteLimitError extends Data.TaggedClass(
  'InvalidWasteLimitError',
)<{
  readonly message: string;
  readonly limit: number;
  readonly actual: number;
}> {}

export class ProductionStatusError extends Data.TaggedClass(
  'ProductionStatusError',
)<{
  readonly message: string;
  readonly currentStatus: string;
}> {}

export type ProductionDomainError =
  | InvalidWasteLimitError
  | ProductionStatusError;
