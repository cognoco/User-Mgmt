export interface PrioritizedError {
  dim: import('./error-metrics').ErrorMetricDimensions;
  score: number;
}

import { ErrorMetrics, ErrorMetricDimensions } from './error-metrics';

export class ErrorPrioritizer {
  constructor(private metrics: ErrorMetrics) {}

  getPriorities(dims: ErrorMetricDimensions[]): PrioritizedError[] {
    return dims
      .map(dim => ({ dim, score: this.metrics.getImpactScore(dim) }))
      .sort((a, b) => b.score - a.score);
  }
}

