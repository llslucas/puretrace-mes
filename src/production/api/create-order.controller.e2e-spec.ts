import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import child_process from 'node:child_process';
import util from 'node:util';
import { PostgresContainerFactory } from 'test/factories/containers/postgres-container';
import { StartedTestContainer } from 'testcontainers';
import { ProductionModule } from '../production.module';
const exec = util.promisify(child_process.exec);

describe('[E2E] Create Order Controller', () => {
  let app: INestApplication;
  let url: string;
  let container: StartedTestContainer;

  beforeAll(async () => {
    container = await PostgresContainerFactory.create();
    const containerHost = container.getHost();
    const containerPort = container.getMappedPort(5432);
    const dbUrl = `postgres://local_user:local_password@${containerHost}:${containerPort}/puretrace`;

    process.env.POSTGRES_HOST = containerHost;
    process.env.POSTGRES_PORT = containerPort.toString();
    process.env.DATABASE_URL = dbUrl;

    await exec(`npx prisma migrate dev`, {
      env: { ...process.env },
    });

    const module: TestingModule = await Test.createTestingModule({
      imports: [ProductionModule],
    }).compile();

    app = module.createNestApplication();
    await app.listen(0);

    url = await app.getUrl();

    await new Promise((r) => setTimeout(r, 500));
  }, 60000);

  afterAll(async () => {
    await app.close();
    await container.stop();
  });

  it('should create an order successfully', async () => {
    const productionOrder = {
      productName: 'Peça X1',
      quantity: 1000,
      wasteLimitInKg: 50,
    };

    const response = await fetch(`${url}/production`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(productionOrder),
    });

    expect(response.ok).toBe(true);

    const result = (await response.json()) as unknown;

    expect(result).toEqual(
      expect.objectContaining({
        ...productionOrder,
      }),
    );
  });
});
