import { Data, Schema } from 'effect';
import { TelemetryData } from '../core/telemetry-data.interface';

export type ProductionStateType =
  | 'RUNNING'
  | 'IDLE'
  | 'OFF'
  | 'SETUP'
  | 'MAINTENANCE';

export interface ProductionEventData {
  machineId: string;
  state: ProductionStateType;
  newState: ProductionStateType;
  durationSeconds: number;
  startTime: Date;
  endTime: Date;
}

export class ProductionEventDataModel
  extends Data.TaggedClass('ProductionEventDataModel')<{
    type: string;
    data: ProductionEventData;
  }>
  implements TelemetryData<ProductionEventData>
{
  static create([
    previous,
    current,
  ]: readonly ProductionEventDto[]): ProductionEventDataModel {
    const durationMs =
      current.timestamp.getTime() - previous.timestamp.getTime();

    const durationSeconds = durationMs / 1000;

    const event: ProductionEventDataModel = new ProductionEventDataModel({
      type: 'ProductionEvent',
      data: {
        machineId: current.machineId,
        state: previous.state,
        newState: current.state,
        durationSeconds: durationSeconds,
        startTime: previous.timestamp,
        endTime: current.timestamp,
      },
    });

    return event;
  }
}

export class ProductionEventDto extends Schema.Class<ProductionEventDto>(
  'ProductionEventDto',
)({
  machineId: Schema.String.pipe(Schema.minLength(3)),
  state: Schema.Literal('RUNNING', 'IDLE', 'OFF', 'SETUP', 'MAINTENANCE'),
  timestamp: Schema.Date,
}) {}
