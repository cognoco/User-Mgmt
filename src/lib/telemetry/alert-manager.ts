export interface AlertManagerOptions {
  bufferSize?: number;
}

import { ApplicationError } from '@/core/common/errors';
import { NotificationChannel } from '@/core/notification/models';

/** Simple fixed size circular buffer */
class CircularBuffer<T extends { timestamp: string }> {
  private buffer: T[] = [];
  private pointer = 0;
  private length = 0;

  constructor(private size: number) {}

  add(item: T) {
    if (this.buffer.length < this.size) {
      this.buffer.push(item);
    } else {
      this.buffer[this.pointer] = item;
      this.pointer = (this.pointer + 1) % this.size;
    }
    if (this.length < this.size) this.length++;
  }

  getSince(timestamp: number): T[] {
    const arr = this.toArray();
    return arr.filter(e => Date.parse(e.timestamp) >= timestamp);
  }

  private toArray(): T[] {
    if (this.buffer.length < this.size) return [...this.buffer];
    return [...this.buffer.slice(this.pointer), ...this.buffer.slice(0, this.pointer)];
  }
}

export type AlertChannel = NotificationChannel;

export interface AlertRule {
  id: string;
  name: string;
  errorPatterns: string[];
  threshold: number;
  timeWindowMs: number;
  cooldownMs: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: AlertChannel[];
  lastTriggered?: number;
}

export class AlertManager {
  private rules: AlertRule[] = [];
  private errorBuffer: CircularBuffer<ApplicationError>;

  constructor(options?: AlertManagerOptions) {
    this.errorBuffer = new CircularBuffer(options?.bufferSize || 1000);
    this.loadRules();
  }

  registerError(error: ApplicationError): void {
    this.errorBuffer.add(error);
    this.evaluateRules();
  }

  addRule(rule: AlertRule): string {
    if (!rule.id) {
      rule.id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
    this.rules.push(rule);
    return rule.id;
  }

  private evaluateRules(): void {
    const now = Date.now();
    for (const rule of this.rules) {
      if (rule.lastTriggered && now - rule.lastTriggered < rule.cooldownMs) {
        continue;
      }
      const matching = this.countMatchingErrors(rule, now - rule.timeWindowMs);
      if (matching >= rule.threshold) {
        this.triggerAlert(rule, matching);
        rule.lastTriggered = now;
      }
    }
  }

  private countMatchingErrors(rule: AlertRule, since: number): number {
    const errors = this.errorBuffer.getSince(since);
    return errors.filter(e =>
      rule.errorPatterns.some(p => e.message.includes(p) || e.code.includes(p))
    ).length;
  }

  private async triggerAlert(rule: AlertRule, count: number): Promise<void> {
    // Alert triggering only works on server side
    if (typeof window !== 'undefined') {
      console.warn('Alert triggering attempted on client side - skipping');
      return;
    }
    
    const subject = `[${rule.severity.toUpperCase()}] ${rule.name}`;
    const message = `${rule.name} triggered with ${count} errors`;
    for (const ch of rule.channels) {
      switch (ch) {
        case NotificationChannel.EMAIL:
          try {
            const { sendEmail } = await import('@/lib/email/sendEmail');
            await sendEmail({
              to: process.env.ALERT_EMAIL_TO || 'alerts@example.com',
              subject,
              html: message,
            });
          } catch (error) {
            console.error('Failed to send email alert:', error);
          }
          break;
        case NotificationChannel.SMS:
          try {
            const { sendSms } = await import('@/lib/sms/sendSms');
            await sendSms({
              to: process.env.ALERT_SMS_TO || '',
              message,
            });
          } catch (error) {
            console.error('Failed to send SMS alert:', error);
          }
          break;
        default:
          console.log(`[${ch}] ${message}`);
      }
    }
  }

  private loadRules(): void {
    // Placeholder for loading rules from configuration or storage
    this.rules = [];
  }
}
