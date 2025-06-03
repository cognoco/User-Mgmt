import { describe, it, expect } from 'vitest';
import { ErrorMetrics, ErrorMetricDimensions } from '../error-metrics';
import { ErrorPrioritizer } from '../prioritization';

const base: ErrorMetricDimensions = {
  errorCode: 'E1',
  serviceName: 'svc',
  environment: 'prod',
  severity: 'high',
};

describe('ErrorPrioritizer', () => {
  it('sorts errors by impact score', () => {
    const metrics = new ErrorMetrics();
    metrics.incrementErrorCount(base);
    metrics.incrementErrorCount(base);
    metrics.incrementErrorCount({ ...base, errorCode: 'E2', severity: 'low' });

    const prioritizer = new ErrorPrioritizer(metrics);
    const sorted = prioritizer.getPriorities([
      base,
      { ...base, errorCode: 'E2', severity: 'low' },
    ]);
    expect(sorted[0].dim.errorCode).toBe('E1');
    expect(sorted[0].score).toBeGreaterThan(sorted[1].score);
  });
});

