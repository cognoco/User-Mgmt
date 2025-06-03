import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrorMetrics, ErrorMetricDimensions } from '../error-metrics';

describe('ErrorMetrics', () => {
  let metrics: ErrorMetrics;
  const base: ErrorMetricDimensions = {
    errorCode: 'E1',
    serviceName: 'svc',
    environment: 'prod',
    severity: 'high',
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    metrics = new ErrorMetrics();
  });

  it('increments and queries counts with partial dimensions', () => {
    metrics.incrementErrorCount(base);
    metrics.incrementErrorCount({ ...base, serviceName: 'svc2' });
    metrics.incrementErrorCount(base);

    expect(metrics.getErrorCount(base)).toBe(2);
    expect(metrics.getErrorCount({ serviceName: 'svc' })).toBe(2);
    expect(metrics.getErrorCount({ environment: 'prod' })).toBe(3);
  });

  it('calculates error rate and detects spikes', () => {
    metrics.incrementErrorCount(base); // t=0
    vi.advanceTimersByTime(200);
    metrics.incrementErrorCount(base); // t=200
    vi.advanceTimersByTime(100);
    metrics.incrementErrorCount(base); // t=300
    const rate = metrics.getErrorRate(base, 1000);
    expect(rate).toBeCloseTo(3, 5);
    const spike = metrics.detectSpike(base, 200, 1.5);
    expect(spike).toBe(true);
  });

  it('tracks timing metrics', () => {
    metrics.incrementErrorCount(base); // t=0
    vi.advanceTimersByTime(300);
    metrics.incrementErrorCount(base); // t=300
    vi.advanceTimersByTime(200);
    metrics.resolveError(base); // t=500
    expect(metrics.getImpactDuration(base)).toBe(500);
    expect(metrics.getTimeToResolution(base)).toBe(200);
    expect(metrics.getDiscoveryTime(base)).toBe(0);
  });

  it('aggregates and provides frequency data', () => {
    metrics.incrementErrorCount(base);
    metrics.incrementErrorCount({ ...base, serviceName: 'svc2' });
    metrics.incrementErrorCount({ ...base, serviceName: 'svc2' });
    const agg = metrics.aggregateBy({}, 'serviceName');
    expect(agg.get('svc')).toBe(1);
    expect(agg.get('svc2')).toBe(2);
    const freq = metrics.getFrequency({ serviceName: 'svc2' }, 1000, 2000);
    expect(freq.reduce((a,b) => a+b, 0)).toBe(2);
  });

  it('calculates impact score', () => {
    metrics.incrementErrorCount(base);
    metrics.incrementErrorCount(base);
    metrics.resolveError(base);
    vi.advanceTimersByTime(1000);
    metrics.resolveError(base);
    const score = metrics.getImpactScore(base, { durationWeight: 0.01 });
    expect(score).toBeGreaterThan(0);
  });
});
