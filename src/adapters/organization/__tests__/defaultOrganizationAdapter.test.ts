import { describe, it, expect } from 'vitest';
import { DefaultOrganizationAdapter } from '@/adapters/organization/defaultOrganizationAdapter';

describe('DefaultOrganizationAdapter', () => {
  const adapter = new DefaultOrganizationAdapter();

  it('createOrganization returns not implemented', async () => {
    const result = await adapter.createOrganization('u1', { name: 'Org' } as any);
    expect(result.success).toBe(false);
  });

  it('getOrganization returns null', async () => {
    const org = await adapter.getOrganization('1');
    expect(org).toBeNull();
  });

  it('getUserOrganizations returns empty array', async () => {
    const list = await adapter.getUserOrganizations('u1');
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(0);
  });
});
