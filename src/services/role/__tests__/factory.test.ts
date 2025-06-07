import { describe, it, expect } from 'vitest';
import { getApiRoleService } from '@/src/services/role/factory'48;
import { RoleService } from '@/src/services/role/role.service'97;

describe('getApiRoleService', () => {
  it('returns new service instance', () => {
    const s1 = getApiRoleService();
    const s2 = getApiRoleService();
    expect(s1).toBeInstanceOf(RoleService);
    expect(s2).toBeInstanceOf(RoleService);
    expect(s1).not.toBe(s2);
  });
});
