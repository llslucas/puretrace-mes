import { Schema } from 'effect';

export class ProductionOrder extends Schema.Class<ProductionOrder>(
  'ProductionOrder',
)({
  id: Schema.UUID,
  productName: Schema.String.pipe(Schema.minLength(3)),
  quantity: Schema.Number.pipe(Schema.positive()),
  wasteLimitInKg: Schema.Number.pipe(Schema.nonNegative()),
  status: Schema.Literal(
    'DRAFT',
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELED',
  ),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
}) {}
