import { Effect, Exit, Fiber, Stream } from 'effect';
import { Observable } from 'rxjs';

export const streamToObservable = <A, E>(
  stream: Stream.Stream<A, E>,
): Observable<A> => {
  return new Observable<A>((subscriber) => {
    // Define o programa que consumirá a stream e joga para o subscriber
    const program = stream.pipe(
      Stream.runForEach((item) => Effect.sync(() => subscriber.next(item))),
    );

    // Executa o programa em uma fiber observável em segundo plano
    const fiber = Effect.runFork(program);

    // Adiciona um listener para quando a stream terminar
    fiber.addObserver((exit) => {
      if (Exit.isFailure(exit)) {
        const error = Exit.causeOption(exit);
        subscriber.error(error);
      } else {
        subscriber.complete();
      }
    });

    // Teardown
    return () => {
      Effect.runSync(Fiber.interruptFork(fiber));
    };
  });
};
