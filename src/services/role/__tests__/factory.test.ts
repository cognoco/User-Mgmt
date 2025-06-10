import { describe, it, expect } from 'vitest';
import { getApiRoleService } from '@/services/role/factory';
import { RoleService } from '@/services/role/role.service';

describe('getApiRoleService', () => {
  it('returns new service instance', () => {
    const s1 = getApiRoleService();
    const s2 = getApiRoleService();
    expect(s1).toBeInstanceOf(RoleService);
    expect(s2).toBeInstanceOf(RoleService);
    expect(s1).not.toBe(s2);
  });
});
