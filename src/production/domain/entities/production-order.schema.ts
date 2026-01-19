import { z } from 'zod';

export const ProductionOrderSchema = z.object({
  id: z.uuid(),
  productName: z.string().min(3),
  quantity: z.number().int().positive(),
  status: z.enum(['DRAFT', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELED']),
  wasteLimitInKg: z.number().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProductionOrder = z.infer<typeof ProductionOrderSchema>;
