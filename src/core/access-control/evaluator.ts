import { MemoryCache } from '@/lib/cache';
import { AccessRule, AttributeCondition, AccessAuditEntry } from '@/core/access-control/models';

export interface EvaluationContext {
  user: Record<string, unknown>;
  resource?: Record<string, unknown>;
  environment?: Record<string, unknown>;
}

export class AccessEvaluator {
  private ruleCache = new MemoryCache<string, (ctx: EvaluationContext) => boolean>();
  private audit: AccessAuditEntry[] = [];

  constructor(private rules: AccessRule[] = []) {}

  setRules(rules: AccessRule[]): void {
    this.rules = rules;
    this.ruleCache = new MemoryCache({ ttl: 60_000 });
  }

  getAuditTrail(): AccessAuditEntry[] {
    return [...this.audit];
  }

  async check(action: string, ctx: EvaluationContext): Promise<boolean> {
    const relevant = this.rules.filter(r => r.action === action);
    for (const rule of relevant) {
      const fn = await this.ruleCache.getOrCreate(rule.id, () => Promise.resolve(this.compile(rule)));
      if (fn(ctx)) {
        this.audit.push({ ruleId: rule.id, action, allowed: true, reason: 'matched', timestamp: Date.now() });
        return true;
      }
    }
    this.audit.push({ ruleId: null, action, allowed: false, reason: 'no rule matched', timestamp: Date.now() });
    return false;
  }

  private compile(rule: AccessRule): (ctx: EvaluationContext) => boolean {
    const checks: Array<(ctx: EvaluationContext) => boolean> = [];

    for (const cond of rule.user || []) {
      checks.push(ctx => this.evaluateCondition(ctx.user, cond));
    }
    for (const cond of rule.resource || []) {
      checks.push(ctx => this.evaluateCondition(ctx.resource || {}, cond));
    }
    for (const cond of rule.environment || []) {
      checks.push(ctx => this.evaluateCondition(ctx.environment || {}, cond));
    }

    return ctx => checks.every(fn => fn(ctx));
  }

  private evaluateCondition(obj: Record<string, unknown>, cond: AttributeCondition): boolean {
    const value = obj[cond.field];
    switch (cond.operator) {
      case 'eq':
        return value === cond.value;
      case 'neq':
        return value !== cond.value;
      case 'in':
        return Array.isArray(cond.value) && cond.value.includes(value as any);
      case 'gt':
        return typeof value === 'number' && typeof cond.value === 'number' && value > cond.value;
      case 'lt':
        return typeof value === 'number' && typeof cond.value === 'number' && value < cond.value;
      default:
        return false;
    }
  }
}
