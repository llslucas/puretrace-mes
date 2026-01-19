import { Schema } from 'effect';

export class CreateProductionOrderDto extends Schema.Class<CreateProductionOrderDto>(
  'CreatePrderDto',
)({
  productName: Schema.String.pipe(Schema.minLength(3)),
  quantity: Schema.Number.pipe(Schema.positive()),
  wasteLimitInKg: Schema.Number.pipe(Schema.nonNegative()),
}) {}
