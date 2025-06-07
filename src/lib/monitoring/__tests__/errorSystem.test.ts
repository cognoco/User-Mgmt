import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../error-logger', () => ({ errorLogger: { info: vi.fn() } }));

vi.mock('@/lib/telemetry', () => ({
  ErrorReporter: class {
    static instance: any;
    static getInstance() { return this.instance || (this.instance = new this()); }
    initialize = vi.fn();
    captureError = vi.fn();
  }
}));

vi.mock('../telemetry', () => {
  return { Telemetry: vi.fn().mockImplementation(() => ({ recordError: vi.fn() })) };
});

const { initializeErrorSystem, reportError, telemetry } = await import('@/lib/monitoring/errorSystem');
const { ErrorReporter } = await import('@/lib/telemetry');

describe('error-system', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (ErrorReporter as any).instance = undefined;
  });

  it('reports error using reporter and telemetry', () => {
    const reporter = ErrorReporter.getInstance();
    const t = (telemetry as any) as { recordError: any };
    reportError(new Error('boom'), { action: 'test' });
    expect(reporter.captureError).toHaveBeenCalled();
    expect(t.recordError).toHaveBeenCalled();
  });

  it('registers global handlers on init', () => {
    const add = vi.spyOn(window, 'addEventListener');
    initializeErrorSystem();
    expect(add).toHaveBeenCalledWith('error', expect.any(Function));
    expect(add).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
  });
});
