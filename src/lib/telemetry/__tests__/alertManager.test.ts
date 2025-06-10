import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AlertManager, AlertRule } from '@/lib/telemetry/alertManager';
import { NotificationChannel } from '@/core/notification/models';
import { ApplicationError } from '@/core/common/errors';
import { SERVER_ERROR } from '@/core/common/errorCodes';
import * as email from '@/lib/email/sendEmail';
import * as sms from '@/lib/sms/sendSms';

vi.mock('@/lib/email/sendEmail');
vi.mock('@/lib/sms/sendSms');

describe('AlertManager', () => {
  let manager: AlertManager;

  beforeEach(() => {
    vi.useFakeTimers();
    manager = new AlertManager({ bufferSize: 5 });
    vi.clearAllMocks();
    vi.mocked(email.sendEmail).mockResolvedValue({ success: true, provider: 'mock' });
    vi.mocked(sms.sendSms).mockResolvedValue({ success: true, provider: 'mock' });
  });

  it('triggers alert when threshold exceeded', async () => {
    const rule: AlertRule = {
      id: 'r1',
      name: 'DB Errors',
      errorPatterns: ['SERVER_002'],
      threshold: 2,
      timeWindowMs: 1000,
      cooldownMs: 1000,
      severity: 'critical',
      channels: [NotificationChannel.EMAIL],
    };
    manager.addRule(rule);

    manager.registerError(new ApplicationError(SERVER_ERROR.SERVER_002, 'fail')); 
    manager.registerError(new ApplicationError(SERVER_ERROR.SERVER_002, 'fail')); 

    expect(email.sendEmail).toHaveBeenCalledTimes(1);
  });

  it('respects cooldown period', () => {
    const rule: AlertRule = {
      id: 'r2',
      name: 'Auth Errors',
      errorPatterns: ['AUTH_001'],
      threshold: 1,
      timeWindowMs: 1000,
      cooldownMs: 5000,
      severity: 'high',
      channels: [NotificationChannel.EMAIL],
    };
    manager.addRule(rule);

    manager.registerError(new ApplicationError(SERVER_ERROR.SERVER_001, 'other')); // not match
    manager.registerError(new ApplicationError(SERVER_ERROR.SERVER_001, 'other')); // not match

    // Should not trigger
    expect(email.sendEmail).toHaveBeenCalledTimes(0);

    manager.registerError(new ApplicationError('AUTH_001' as any, 'auth fail'));
    expect(email.sendEmail).toHaveBeenCalledTimes(1);

    manager.registerError(new ApplicationError('AUTH_001' as any, 'auth again'));
    expect(email.sendEmail).toHaveBeenCalledTimes(1); // cooldown

    vi.advanceTimersByTime(5000);
    manager.registerError(new ApplicationError('AUTH_001' as any, 'auth again'));
    expect(email.sendEmail).toHaveBeenCalledTimes(2);
  });

  it('supports sms channel', () => {
    const rule: AlertRule = {
      id: 'r3',
      name: 'SMS Rule',
      errorPatterns: ['SMS_ERR'],
      threshold: 1,
      timeWindowMs: 1000,
      cooldownMs: 1000,
      severity: 'high',
      channels: [NotificationChannel.SMS],
    };
    manager.addRule(rule);
    manager.registerError(new ApplicationError('SMS_ERR' as any, 'boom'));
    expect(sms.sendSms).toHaveBeenCalledTimes(1);
  });

  it('generates rule id and handles buffer overflow', () => {
    const rule: AlertRule = {
      id: '',
      name: 'Overflow',
      errorPatterns: ['OF'],
      threshold: 3,
      timeWindowMs: 1000,
      cooldownMs: 1000,
      severity: 'low',
      channels: [NotificationChannel.EMAIL],
    };
    const id = manager.addRule(rule);
    expect(id).toBeTruthy();
    for (let i = 0; i < 7; i++) {
      manager.registerError(new ApplicationError('OF' as any, 'err')); 
    }
    expect(email.sendEmail).toHaveBeenCalledTimes(1);
  });

  it('logs for unknown channel', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const rule: AlertRule = {
      id: 'r4',
      name: 'Other',
      errorPatterns: ['X'],
      threshold: 1,
      timeWindowMs: 1000,
      cooldownMs: 1000,
      severity: 'low',
      channels: ['other' as unknown as NotificationChannel],
    };
    manager.addRule(rule);
    manager.registerError(new ApplicationError('X' as any, 'x'));
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
});
