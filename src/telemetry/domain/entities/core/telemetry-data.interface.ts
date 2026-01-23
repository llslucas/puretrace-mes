export interface TelemetryData<DataType = unknown> {
  type: string;
  data: DataType;
}
