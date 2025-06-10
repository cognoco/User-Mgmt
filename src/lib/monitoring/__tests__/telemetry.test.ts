import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Telemetry, AlertNotifier } from '@/lib/monitoring/telemetry';

class TestNotifier implements AlertNotifier {
  public alerts: any[] = [];
  notify(alert: any) {
    this.alerts.push(alert);
  }
}

describe('Telemetry', () => {
  let telemetry: Telemetry;
  let notifier: TestNotifier;

  beforeEach(() => {
    vi.useFakeTimers();
    telemetry = new Telemetry({ alertThresholds: { DB_ERROR: 2 }, alertCooldownMs: 500 });
    notifier = new TestNotifier();
    telemetry.addAlertNotifier(notifier);
  });

  it('tracks error counts and user impact', () => {
    telemetry.recordError({ type: 'DB_ERROR', message: 'fail', userId: 'u1', userSegment: 'pro', action: 'save', critical: true });
    telemetry.recordError({ type: 'DB_ERROR', message: 'fail2', userId: 'u2', userSegment: 'free', action: 'save' });

    const m = telemetry.getMetrics('DB_ERROR')!;
    expect(m.count).toBe(2);
    expect(m.criticalCount).toBe(1);
    expect(m.nonCriticalCount).toBe(1);
    expect(m.affectedUsers.size).toBe(2);
    expect(m.segmentImpact.get('pro')).toBe(1);
    expect(m.segmentImpact.get('free')).toBe(1);
    expect(m.actionCounts.get('save')).toBe(2);
  });

  it('calculates resolution time', () => {
    telemetry.recordError({ type: 'NET', message: 'timeout' });
    vi.advanceTimersByTime(1000);
    telemetry.resolveError('NET');
    const m = telemetry.getMetrics('NET')!;
    expect(m.resolutionTimes[0]).toBe(1000);
  });

  it('handles missing metrics gracefully', () => {
    expect(telemetry.getMetrics('UNKNOWN')).toBeUndefined();
    expect(telemetry.getErrorRate('UNKNOWN')).toBe(0);
    telemetry.resolveError('UNKNOWN'); // should not throw
  });

  it('sends alerts respecting thresholds and cooldown', () => {
    telemetry.recordError({ type: 'DB_ERROR', message: 'a', critical: true });
    expect(notifier.alerts).toHaveLength(0);
    telemetry.recordError({ type: 'DB_ERROR', message: 'b', critical: true });
    expect(notifier.alerts).toHaveLength(1);
    telemetry.recordError({ type: 'DB_ERROR', message: 'c', critical: true });
    expect(notifier.alerts).toHaveLength(1); // within cooldown
    vi.advanceTimersByTime(600);
    telemetry.recordError({ type: 'DB_ERROR', message: 'd', critical: true });
    expect(notifier.alerts).toHaveLength(2);
  });

  it('reports rates and highest impact errors', () => {
    telemetry.recordError({ type: 'A', message: 'x', userId: 'u1' });
    telemetry.recordError({ type: 'B', message: 'y', userId: 'u2' });
    telemetry.recordError({ type: 'B', message: 'z', userId: 'u3' });
    vi.advanceTimersByTime(30000);
    const rate = telemetry.getErrorRate('A', 60000);
    expect(rate).toBeCloseTo(1 / 60, 5);
    const high = telemetry.getHighestImpactErrors();
    expect(high[0]).toBe('B');
  });

  it('collects error feedback', () => {
    telemetry.recordFeedback('E1', true);
    telemetry.recordFeedback('E1', false);
    const m = telemetry.getMetrics('E1')!;
    expect(m.feedbackTotal).toBe(2);
    expect(m.feedbackHelpful).toBe(1);
  });
});
