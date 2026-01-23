import {
  Effect,
  PubSub,
  Queue,
  Stream,
  Chunk,
  Fiber,
  TestClock,
  TestContext,
} from 'effect';
import { TelemetryHandler } from '../handlers/telemetry-handler.interface';
import { TelemetryModel } from '../..//domain/entities/telemetry.model';
import { RawMessage, TelemetryPipeline } from './telemetry.pipeline';
import { MachineTelemetry } from '../..//domain/entities/telemetry.schema';

describe('[Infra Layer] Telemetry Pipeline', () => {
  it('should recover after a fatal error', async () => {
    return Effect.gen(function* (_) {
      const inputQueue = yield* _(Queue.unbounded<RawMessage>());
      const pubSub = yield* _(PubSub.unbounded<MachineTelemetry>());

      let callCount = 0;

      const mockHandler: TelemetryHandler = {
        match: () => true,
        handle: () =>
          Effect.sync(() => {
            callCount++;

            if (callCount === 2) {
              throw new Error('Simulated Fatal Error');
            }

            const telemetry = TelemetryModel.create({
              machineId: 'TEST-MACHINE',
              temperature: 80,
              powerConsumption: 10,
            });

            return telemetry;
          }),
      };

      const pipeline = new TelemetryPipeline([mockHandler]);

      yield* _(
        Queue.offer(inputQueue, {
          topic: 'teste-1',
          payload: Buffer.from(''),
        }),
      );

      yield* _(
        Queue.offer(inputQueue, {
          topic: 'teste-2',
          payload: Buffer.from(''),
        }),
      );

      yield* _(
        Queue.offer(inputQueue, {
          topic: 'teste-3',
          payload: Buffer.from(''),
        }),
      );

      const program = pipeline.build(Stream.fromQueue(inputQueue), pubSub);
      const fiber = yield* _(Effect.fork(program));

      const resultsFiber = yield* _(
        Stream.fromPubSub(pubSub).pipe(
          Stream.take(2),
          Stream.runCollect,
          Effect.fork,
        ),
      );

      yield* TestClock.adjust('1 minute');

      const results = yield* _(Fiber.join(resultsFiber));

      expect(results.length).toBe(2);
      expect(Chunk.toReadonlyArray(results)).toHaveLength(2);
      expect(callCount).toBe(3);

      yield* _(Fiber.interrupt(fiber));
    }).pipe(Effect.provide(TestContext.TestContext), Effect.runPromise);
  });
});
