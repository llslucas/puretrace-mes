import { GenericContainer, Wait } from 'testcontainers';

export class PostgresContainerFactory {
  static async create() {
    const container = await new GenericContainer('postgres:18-alpine')
      .withExposedPorts(5432)
      .withEnvironment({
        POSTGRES_HOST: 'localhost',
        POSTGRES_USER: 'local_user',
        POSTGRES_PASSWORD: 'local_password',
        POSTGRES_DB: 'puretrace',
      })
      .withWaitStrategy(
        Wait.forLogMessage('database system is ready to accept connections'),
      )
      .start();

    return container;
  }
}
