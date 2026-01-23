import { Injectable } from '@nestjs/common';
import { Effect, Option, Ref } from 'effect';
import { TelemetryHandler } from 'src/telemetry/domain/entities/core/telemetry-handler.interface';
import { TelemetryDataProcessingError } from 'src/telemetry/domain/entities/core/telemetry.errors';
import {
  ProductionEventData,
  ProductionEventDataModel,
} from 'src/telemetry/domain/entities/models/production-event-data.model';
import { ProcessProductionEventUseCase } from 'src/telemetry/domain/features/production-event/process-production-event.use-case';

type StateMap = Map<string, unknown>;

@Injectable()
export class ProductionEventHandler implements TelemetryHandler<ProductionEventData> {
  private stateRef: Ref.Ref<StateMap>;

  constructor() {
    this.stateRef = Ref.unsafeMake(new Map<string, unknown>());
  }

  match(topic: string): boolean {
    return topic.endsWith('production-event');
  }

  handle(
    topic: string,
    payload: Buffer,
  ): Effect.Effect<
    Option.Option<ProductionEventDataModel>,
    TelemetryDataProcessingError,
    never
  > {
    const state = this.stateRef;

    return Effect.gen(function* (_) {
      const useCase = new ProcessProductionEventUseCase();
      const machineId = topic.split('/')[2];

      const currentEvent = yield* _(
        Effect.try({
          try: () => JSON.parse(payload.toString()) as unknown,
          catch: (e) =>
            new TelemetryDataProcessingError({
              step: 'JSON_PARSE',
              originalError: e as SyntaxError,
            }),
        }),
      );

      const previousEvent = yield* _(
        Ref.modify(state, (map) => {
          const previous = Option.fromNullable(map.get(machineId));

          map.set(machineId, currentEvent);

          return [previous, map] as const;
        }),
      );

      if (Option.isNone(previousEvent)) {
        return Option.none();
      }

      const previous = previousEvent.value;

      return Option.some(yield* _(useCase.execute([previous, currentEvent])));
    });
  }
}
