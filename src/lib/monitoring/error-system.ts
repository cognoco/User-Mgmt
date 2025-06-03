import { ErrorReporter } from '@/lib/telemetry';
import { errorLogger } from './error-logger';
import { Telemetry } from './telemetry';

let initialized = false;
const telemetry = new Telemetry();

function capture(err: unknown, context: Record<string, any> = {}) {
  const reporter = ErrorReporter.getInstance();
  reporter.initialize();
  const error = err instanceof Error ? err : new Error(String(err));
  reporter.captureError(error, context);
  telemetry.recordError({
    type: error.name,
    message: error.message,
    userId: context.userId,
    userSegment: context.userSegment,
    action: context.action,
    critical: (context.status ?? 500) >= 500,
  });
}

export function initializeErrorSystem() {
  if (initialized) return;
  initialized = true;
  if (typeof window !== 'undefined') {
    window.addEventListener('error', e => {
      capture(e.error, { source: 'window' });
    });
    window.addEventListener('unhandledrejection', e => {
      capture(e.reason, { source: 'window', action: 'unhandledrejection' });
    });
  } else if (typeof process !== 'undefined') {
    process.on('uncaughtException', err => {
      capture(err, { source: 'server', action: 'uncaughtException' });
    });
    process.on('unhandledRejection', reason => {
      capture(reason as any, { source: 'server', action: 'unhandledRejection' });
    });
  }
  errorLogger.info('Error system initialized');
}

export { telemetry, capture as reportError };
