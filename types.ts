export interface DataPoint {
  id: string;
  [key: string]: string | number;
}

export enum TimeUnit {
  DAYS = 'Days',
  WEEKS = 'Weeks',
  MONTHS = 'Months',
}

export interface AppConfig {
  timeUnit: TimeUnit;
  eventCol: string; // The column indicating mortality (1 = dead, 0 = censored)
  groupCol: string; // Optional grouping
  showConfInt: boolean;
  showRiskTable: boolean;
}

export interface SurvivalStep {
  time: number;
  nRisk: number;
  nEvent: number;
  nCensor: number;
  survivalProb: number;
  stdErr: number;
  lowerCI: number;
  upperCI: number;
  group: string;
}

export interface AnalysisResult {
  steps: SurvivalStep[];
  groups: string[];
}
