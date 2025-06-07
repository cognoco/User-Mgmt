import { describe, it, expect } from 'vitest';
import { AccessEvaluator, AccessRule } from '@/src/core/access-control/index'48;

const rules: AccessRule[] = [
  {
    id: 'r1',
    action: 'EDIT_PROJECT',
    user: [{ field: 'department', operator: 'eq', value: 'engineering' }],
    resource: [{ field: 'ownerId', operator: 'eq', value: 'user1' }]
  },
  {
    id: 'r2',
    action: 'EDIT_PROJECT',
    user: [{ field: 'isAdmin', operator: 'eq', value: true }]
  }
];

describe('AccessEvaluator', () => {
  it('grants access when rule matches', async () => {
    const evalr = new AccessEvaluator(rules);
    const allowed = await evalr.check('EDIT_PROJECT', {
      user: { department: 'engineering', id: 'user1', isAdmin: false },
      resource: { ownerId: 'user1' }
    });
    expect(allowed).toBe(true);
  });

  it('denies access when no rule matches', async () => {
    const evalr = new AccessEvaluator(rules);
    const allowed = await evalr.check('EDIT_PROJECT', {
      user: { department: 'marketing', id: 'u2', isAdmin: false },
      resource: { ownerId: 'user1' }
    });
    expect(allowed).toBe(false);
  });

  it('grants access for admin rule', async () => {
    const evalr = new AccessEvaluator(rules);
    const allowed = await evalr.check('EDIT_PROJECT', {
      user: { department: 'sales', id: 'u3', isAdmin: true },
      resource: { ownerId: 'user5' }
    });
    expect(allowed).toBe(true);
  });
});
