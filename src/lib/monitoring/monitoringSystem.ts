// Monitoring system integration for error aggregation and alerting
import { telemetry } from '@/src/lib/monitoring/errorSystem'69;
import { AlertManager, AlertRule } from '@/lib/telemetry/alertManager'114;
import { ApplicationError } from '@/core/common/errors';

let initialized = false;
export const alertManager = new AlertManager();

export interface MonitoringConfig {
  alertRules?: AlertRule[];
}

export function initializeMonitoringSystem(config: MonitoringConfig = {}): void {
  if (initialized) return;
  initialized = true;

  if (config.alertRules) {
    for (const rule of config.alertRules) {
      alertManager.addRule(rule);
    }
  }

  telemetry.addAlertNotifier(alert => {
    const error = new ApplicationError(
      alert.errorType as any,
      alert.message,
      alert.severity === 'critical' ? 500 : 400,
    );
    alertManager.registerError(error);
  });
}
