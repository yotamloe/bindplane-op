export interface LogRecord {
  timestamp: string;
  body: any;
  severity: string;
  attributes: Record<string, any>;
  resource: Record<string, any>;
}

export interface MetricRecord {
  name: string;
  timestamp: string;
  value: any;
  unit: string;
  type: string;
  attributes: Record<string, any>;
  resource: Record<string, any>;
}

export interface TraceRecord {
  // TODO
}

export type UnknownRecord = LogRecord | MetricRecord | TraceRecord;
