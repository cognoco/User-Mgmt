import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Telemetry } from '@/lib/monitoring/telemetry';
import { ErrorDashboardData, TimeRange } from '@/src/lib/telemetry/dashboardData';
import { ErrorReporter } from '@/src/lib/telemetry/errorReporting';

describe('ErrorDashboardData', () => {
  let telemetry: Telemetry;
  let service: ErrorDashboardData;

  beforeEach(() => {
    vi.useFakeTimers();
    telemetry = new Telemetry();
    service = new ErrorDashboardData(telemetry);
    (ErrorReporter as any).instance = undefined;
  });

  function advanceAndRecord(type: string, userId?: string, segment?: string, action?: string) {
    telemetry.recordError({ type, message: 'm', userId, userSegment: segment, action });
    vi.advanceTimersByTime(1000);
  }

  it('returns top errors', async () => {
    advanceAndRecord('A');
    advanceAndRecord('A');
    advanceAndRecord('B');
    const range: TimeRange = { start: new Date(0), end: new Date(Date.now()) };
    const top = await service.getTopErrors(range, 1);
    expect(top[0].errorType).toBe('A');
    expect(top[0].count).toBe(2);
  });

  it('provides error trends', async () => {
    for (let i = 0; i < 5; i++) advanceAndRecord('T');
    const now = Date.now();
    const range: TimeRange = { start: new Date(now - 5000), end: new Date(now) };
    const trend = await service.getErrorTrends('T', range);
    expect(trend.counts.reduce((a, b) => a + b, 0)).toBe(5);
    expect(trend.movingAverage.length).toBe(trend.counts.length);
  });

  it('computes user impact and distribution', async () => {
    advanceAndRecord('X', 'u1', 'pro');
    advanceAndRecord('X', 'u2', 'pro');
    advanceAndRecord('Y', 'u1', 'free');
    const range: TimeRange = { start: new Date(0), end: new Date(Date.now()) };
    const impact = await service.getUserImpact(range);
    expect(impact.totalUsers).toBe(2);
    const dist = await service.getErrorDistribution(['segment'], range);
    expect(dist.segment.pro).toBe(2);
    expect(dist.segment.free).toBe(1);
  });

  it('handles unknown errors gracefully', async () => {
    const range: TimeRange = { start: new Date(0), end: new Date(Date.now()) };
    const trend = await service.getErrorTrends('NOPE', range);
    expect(trend.counts).toEqual([]);
    const dist = await service.getErrorDistribution(['action', 'errorType'], range);
    expect(dist.action).toEqual({});
    expect(dist.errorType).toEqual({});
  });

  it('aggregates actions and error types', async () => {
    advanceAndRecord('Z', undefined, undefined, 'save');
    advanceAndRecord('Z', undefined, undefined, 'save');
    advanceAndRecord('Q', undefined, undefined, 'open');
    const range: TimeRange = { start: new Date(0), end: new Date(Date.now()) };
    const dist = await service.getErrorDistribution(['action', 'errorType'], range);
    expect(dist.action.save).toBe(2);
    expect(dist.action.open).toBe(1);
    expect(dist.errorType.unknown).toBe(3);
  });

  it('reports average resolution time', async () => {
    telemetry.recordError({ type: 'RES', message: 'fail' });
    vi.advanceTimersByTime(500);
    telemetry.resolveError('RES');
    const avg = await service.getAverageResolutionTime('RES');
    expect(avg).toBe(500);
  });

  it('provides root cause clusters', async () => {
    const reporter = ErrorReporter.getInstance();
    reporter.initialize();
    reporter.captureError(new Error('Boom at 1'));
    reporter.captureError(new Error('Boom at 2'));
    const clusters = await service.getRootCauseClusters();
    const c = clusters.find(cl => cl.id.includes('SERVER_001'))!;
    expect(c.count).toBe(2);
  });
});
