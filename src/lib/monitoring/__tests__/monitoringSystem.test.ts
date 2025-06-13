import { describe, it, expect, vi, beforeEach } from 'vitest';

const addAlertNotifier = vi.fn();
vi.mock('@/lib/monitoring/errorSystem', () => ({ telemetry: { addAlertNotifier } }));

const registerError = vi.fn();
vi.mock('@/lib/telemetry/alert-manager', () => ({
  AlertManager: vi.fn().mockImplementation(() => ({
    addRule: vi.fn(),
    registerError,
  })),
}));

vi.mock('@/core/common/errors', async () => {
  const actual = await vi.importActual('@/core/common/errors');
  return { ...actual, ApplicationError: actual.ApplicationError };
});

const { initializeMonitoringSystem } = await import('@/lib/monitoring/monitoringSystem');

describe('monitoring-system', () => {
  let initializeMonitoringSystem: typeof import('../monitoringSystem').initializeMonitoringSystem;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    ({ initializeMonitoringSystem } = await import('@/lib/monitoring/monitoringSystem'));
  });

  it('registers alert notifier', () => {
    initializeMonitoringSystem();
    expect(addAlertNotifier).toHaveBeenCalledTimes(1);
  });

  it('forwards alerts to alert manager', () => {
    initializeMonitoringSystem();
    const notifier = addAlertNotifier.mock.calls[0][0];
    notifier.notify({
      errorType: 'ERR',
      message: 'boom',
      severity: 'critical',
      count: 1,
    });
    expect(registerError).toHaveBeenCalled();
  });
});
