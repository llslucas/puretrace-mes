import { GenericContainer, Wait } from 'testcontainers';

export class MosquittoContainerFactory {
  static async create() {
    const container = await new GenericContainer('eclipse-mosquitto:2')
      .withExposedPorts(1883)
      .withCommand(['mosquitto', '-c', '/mosquitto-no-auth.conf'])
      .withCopyContentToContainer([
        {
          content: 'listener 1883\nallow_anonymous true ',
          target: '/mosquitto-no-auth.conf',
        },
      ])
      .withWaitStrategy(Wait.forLogMessage('mosquitto version 2', 1))
      .start();

    return container;
  }
}
