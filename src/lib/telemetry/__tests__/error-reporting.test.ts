import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorReporter } from '../error-reporting';
import { errorLogger } from '@/lib/monitoring/error-logger';

vi.mock('@/lib/monitoring/error-logger', () => ({
  errorLogger: { error: vi.fn() },
}));

describe('ErrorReporter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    (ErrorReporter as any).instance = undefined;
  });

  it('returns singleton instance', () => {
    const a = ErrorReporter.getInstance();
    const b = ErrorReporter.getInstance();
    expect(a).toBe(b);
  });

  it('adds breadcrumbs up to the limit', () => {
    const reporter = ErrorReporter.getInstance();
    reporter.initialize();
    for (let i = 0; i < 25; i++) {
      reporter.addBreadcrumb(`b${i}`, 'test');
    }
    reporter.captureError(new Error('fail'));
    const ctx = (errorLogger.error as any).mock.calls[0][1];
    expect(ctx.breadcrumbs).toHaveLength(20);
  });

  it('captures error with user context', () => {
    const reporter = ErrorReporter.getInstance();
    reporter.initialize();
    reporter.setUserContext({ id: 'u1' });
    reporter.addBreadcrumb('clicked', 'ui');
    const id = reporter.captureError(new Error('boom'), { requestId: 'r1' });
    expect(typeof id).toBe('string');
    expect(errorLogger.error).toHaveBeenCalled();
    const ctx = (errorLogger.error as any).mock.calls[0][1];
    expect(ctx.user.id).toBe('u1');
    expect(ctx.requestId).toBe('r1');
    expect(ctx.breadcrumbs.length).toBe(1);
  });
});
