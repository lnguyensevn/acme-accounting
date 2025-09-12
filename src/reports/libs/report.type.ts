import { SharedData } from './worker-pool';

export enum ReportType {
  accounts = 'accounts',
  yearly = 'yearly',
  fs = 'fs',
}

export enum ReportStatus {
  not_started = 'not_started',
  generateing = 'generating',
  data_ready = 'data_ready',
  stale = 'stale',
  generated = 'generated',
}

export interface ReportState {
  status: ReportStatus;
  metrics?: {
    dataFetchingTimeTaken: number;
    dataWriteTimeTake: number;
    totalTimeTaken: number;
    generatedAt: Date;
  };
}

export type ReportStateMap = {
  [key in ReportType]?: ReportState;
};

export class CacheState {
  time?: Date;
  data: SharedData = { balances: {} };
  states: ReportStateMap = {};

  setData(data: SharedData) {
    this.data = data;
    this.time = new Date();
  }

  setStates(type: ReportType, state: ReportState) {
    this.states[type] = state;
  }

  clear() {
    this.time = undefined;
    this.data = { balances: {} };
    this.states = {};
  }
}

export interface WriteResult {
  writeTimeTaken: number;
  filePath: string;
}
