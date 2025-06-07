export interface PrioritizedError {
  dim: import('@/src/lib/telemetry/errorMetrics').ErrorMetricDimensions;
  score: number;
}

import { ErrorMetrics, ErrorMetricDimensions } from '@/src/lib/telemetry/errorMetrics';

export class ErrorPrioritizer {
  constructor(private metrics: ErrorMetrics) {}

  getPriorities(dims: ErrorMetricDimensions[]): PrioritizedError[] {
    return dims
      .map(dim => ({ dim, score: this.metrics.getImpactScore(dim) }))
      .sort((a, b) => b.score - a.score);
  }
}

