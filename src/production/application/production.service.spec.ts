import { Test, TestingModule } from '@nestjs/testing';
import { ProductionOrderRepository } from '../domain/entities/production-order.repository';
import { CreateProductionOrderDto } from '../domain/entities/production-order.schema';
import { InMemoryProductionOrderRepository } from '../infra/in-memory-production-order-repository';
import { ProductionService } from './production.service';
import { Effect } from 'effect';

describe('[Application Layer] Production Service', () => {
  let service: ProductionService;
  let repository: ProductionOrderRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionService,
        {
          provide: ProductionOrderRepository,
          useClass: InMemoryProductionOrderRepository,
        },
      ],
    }).compile();

    service = module.get<ProductionService>(ProductionService);
    repository = module.get<ProductionOrderRepository>(
      ProductionOrderRepository,
    );
  });

  it('should create a production order and persist it in memory', async () => {
    const validInput: CreateProductionOrderDto = {
      productName: 'Peça X1',
      quantity: 1000,
      wasteLimitInKg: 50,
    };

    const result = await service.createOrder(validInput);

    expect(result.id).toBeDefined();
    expect(result.status).toBe('DRAFT');

    const savedInDb = await Effect.runPromise(repository.findById(result.id));
    expect(savedInDb).not.toBeNull();
    expect(savedInDb?.productName).toBe('Peça X1');
  });
});
