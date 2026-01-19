import z from 'zod';
import { ProductionOrderSchema } from '../../entities/production-order.schema';

export const CreateProductionOrderSchema = ProductionOrderSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateProductionOrderDto = z.infer<
  typeof CreateProductionOrderSchema
>;
