import { describe, it, expect, vi } from 'vitest';
import { logPermissionChange } from '../permissionAuditLogger';
import { logUserAction } from '../auditLogger';

vi.mock('../auditLogger', () => ({ logUserAction: vi.fn() }));

describe('logPermissionChange', () => {
  it('forwards parameters to logUserAction', async () => {
    await logPermissionChange({
      action: 'ROLE_ASSIGNED',
      performedBy: 'admin1',
      targetType: 'role',
      targetId: 'r1',
      before: { roles: [] },
      after: { roles: ['r1'] },
      reason: 'test',
      ticket: 'T1'
    });
    expect(logUserAction).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'admin1',
        action: 'ROLE_ASSIGNED',
        targetResourceType: 'role',
        targetResourceId: 'r1',
        details: expect.objectContaining({
          before: { roles: [] },
          after: { roles: ['r1'] },
          reason: 'test',
          ticket: 'T1'
        })
      })
    );
  });
});
