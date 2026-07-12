export interface BestPerformingSource {
  source: string; // converted to string from enum
  rate: number;
}

export interface BestPerformingResume {
  id: string;
  title: string;
  rate: number;
}

export interface ConversionMetrics {
  submittedToProgressed: number | null;
  oaToInterview: number | null;
  interviewToOffer: number | null;
}

// Key of ConversionMetrics — used to label the biggest drop-off stage in the UI
export type BiggestDropOffStage = keyof ConversionMetrics | null;

export interface FunnelMetrics {
  submitted: number;
  progressedBeyondApplied: number;
  reachedInterview: number;
  reachedOffer: number;
}

export interface TrendPoint {
  weekStart: Date;
  count: number;
}

export interface SourceBreakdownPoint {
  source: string; // converted to string from enum
  rate: number;
}

export interface ResumeResponseRatePoint {
  title: string;
  applicationCount: number;
  responseRate: number; // [0, 1]
}

export interface AnalyticsData {
  bestPerformingSource: SourceBreakdownPoint | null;
  bestPerformingResume: BestPerformingResume | null;
  biggestDropOffStage: BiggestDropOffStage;
  rejectionRate: number | null;

  funnelMetrics: FunnelMetrics;
  conversionMetrics: ConversionMetrics;

  trend: TrendPoint[];
  sourceBreakdown: SourceBreakdownPoint[];
  resumeResponseRate: ResumeResponseRatePoint[]; // top 5
}
