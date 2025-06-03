import { describe, it, expect, vi, beforeEach } from 'vitest';

const addAlertNotifier = vi.fn();
vi.mock('../error-system', () => ({ telemetry: { addAlertNotifier } }));

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

const { initializeMonitoringSystem } = await import('../monitoring-system');

describe('monitoring-system', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers alert notifier', () => {
    initializeMonitoringSystem();
    expect(addAlertNotifier).toHaveBeenCalledTimes(1);
  });

  it('forwards alerts to alert manager', () => {
    initializeMonitoringSystem();
    const cb = addAlertNotifier.mock.calls[0][0];
    cb({ errorType: 'ERR', message: 'boom', severity: 'critical', count: 1 });
    expect(registerError).toHaveBeenCalled();
  });
});
