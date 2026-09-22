export type InterestType = 'simple' | 'compound' | 'continuous';
export type PaymentTiming = 'ordinary' | 'due';
export type SeriesType =
  | 'single'
  | 'uniform'
  | 'arithmetic'
  | 'geometric'
  | 'deferred'
  | 'perpetuity';

export type FrequencyKey =
  | 'annual'
  | 'semiannual'
  | 'fourMonth'
  | 'quarterly'
  | 'bimonthly'
  | 'monthly'
  | 'weekly'
  | 'daily'
  | 'continuous';

export interface FrequencyOption {
  key: FrequencyKey;
  label: string;
  periodsPerYear: number;
}

export const FREQUENCIES: FrequencyOption[] = [
  { key: 'annual', label: 'Anual', periodsPerYear: 1 },
  { key: 'semiannual', label: 'Semestral', periodsPerYear: 2 },
  { key: 'fourMonth', label: 'Cuatrimestral', periodsPerYear: 3 },
  { key: 'quarterly', label: 'Trimestral', periodsPerYear: 4 },
  { key: 'bimonthly', label: 'Bimestral', periodsPerYear: 6 },
  { key: 'monthly', label: 'Mensual', periodsPerYear: 12 },
  { key: 'weekly', label: 'Semanal', periodsPerYear: 52 },
  { key: 'daily', label: 'Diaria', periodsPerYear: 365 },
  { key: 'continuous', label: 'Continua', periodsPerYear: Number.POSITIVE_INFINITY },
];

export interface CashFlow {
  period: number;
  amount: number;
  label?: string;
}

export interface TimelinePoint {
  period: number;
  amount: number;
  kind: 'present' | 'future' | 'annuity' | 'gradient' | 'custom';
  label: string;
}

export interface Scenario {
  title: string;
  presentValue: number;
  futureValue: number;
  annuity: number;
  gradient: number;
  geometricRatePercent: number;
  years: number;
  periodsOverride: number | null;
  nominalAnnualPercent: number;
  interestType: InterestType;
  capitalization: FrequencyKey;
  paymentFrequency: FrequencyKey;
  seriesType: SeriesType;
  paymentTiming: PaymentTiming;
  deferredPeriods: number;
  extraFlows: CashFlow[];
}

export interface RateBreakdown {
  nominalAnnual: number;
  capitalization: FrequencyKey;
  paymentFrequency: FrequencyKey;
  interestType: InterestType;
  effectiveAnnual: number;
  periodRate: number;
  periods: number;
  capitalizationPeriods: number;
}

export interface FactorRow {
  n: number;
  fp: number;
  pf: number;
  fa: number;
  af: number;
  pa: number;
  ap: number;
  pg: number;
  ag: number;
  fg: number;
}

export interface ResultTable {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

export interface Highlight {
  label: string;
  value: string;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
}

export interface CalcOutput {
  title: string;
  formula: string;
  steps: string[];
  highlights: Highlight[];
  tables: ResultTable[];
  conclusion: string;
  points: TimelinePoint[];
  scenario?: Scenario;
}

export const DEFAULT_SCENARIO: Scenario = {
  title: 'Escenario base',
  presentValue: 10_000,
  futureValue: 0,
  annuity: 0,
  gradient: 0,
  geometricRatePercent: 0,
  years: 5,
  periodsOverride: null,
  nominalAnnualPercent: 12,
  interestType: 'compound',
  capitalization: 'monthly',
  paymentFrequency: 'annual',
  seriesType: 'single',
  paymentTiming: 'ordinary',
  deferredPeriods: 0,
  extraFlows: [],
};

export function frequencyOf(key: FrequencyKey): FrequencyOption {
  return FREQUENCIES.find((item) => item.key === key) ?? FREQUENCIES[0];
}
