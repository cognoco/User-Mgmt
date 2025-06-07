export interface PrioritizedError {
  dim: import('@/lib/telemetry/errorMetrics').ErrorMetricDimensions;
  score: number;
}

import { ErrorMetrics, ErrorMetricDimensions } from '@/lib/telemetry/errorMetrics';

export class ErrorPrioritizer {
  constructor(private metrics: ErrorMetrics) {}

  getPriorities(dims: ErrorMetricDimensions[]): PrioritizedError[] {
    return dims
      .map(dim => ({ dim, score: this.metrics.getImpactScore(dim) }))
      .sort((a, b) => b.score - a.score);
  }
}

