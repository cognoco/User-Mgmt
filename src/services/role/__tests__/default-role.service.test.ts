import { describe, it, expect, beforeEach } from 'vitest';
import { DefaultRoleService, type RoleRecord } from '../default-role.service';

describe('DefaultRoleService', () => {
  let service: DefaultRoleService;
  let roles: Record<string, RoleRecord>;

  beforeEach(() => {
    service = new DefaultRoleService();
    roles = {
      A: { id: 'A', permissionIds: ['p1', 'p2'] },
      B: { id: 'B', permissionIds: ['p3'], parentRoleId: 'A' },
      C: { id: 'C', permissionIds: ['p4'], parentRoleId: 'B' }
    };
    Object.values(roles).forEach(r => service.addRole(r));
  });

  it('returns ancestor roles in order', () => {
    const ancestors = service.getAncestorRoles('C').map(r => r.id);
    expect(ancestors).toEqual(['B', 'A']);
  });

  it('returns descendant roles', () => {
    const desc = service.getDescendantRoles('A').map(r => r.id);
    expect(desc.sort()).toEqual(['B', 'C']);
  });

  it('calculates effective permissions with inheritance', () => {
    const perms = service.getEffectivePermissions('C');
    expect(perms.sort()).toEqual(['p1', 'p2', 'p3', 'p4']);
  });

  it('detects circular references when setting parent', () => {
    expect(() => service.setParentRole('A', 'C')).toThrow('Circular role hierarchy');
  });

  it('setParentRole ignores unknown role', () => {
    service.setParentRole('X', 'A');
    expect(service.getAncestorRoles('X')).toEqual([]);
  });

  it('returns empty lists for missing relations', () => {
    expect(service.getAncestorRoles('A')).toEqual([]);
    expect(service.getDescendantRoles('C')).toEqual([]);
  });

  it('returns empty permissions for unknown role', () => {
    expect(service.getEffectivePermissions('missing')).toEqual([]);
  });

  it('handles missing parent gracefully', () => {
    service.setParentRole('B', 'X');
    expect(service.getAncestorRoles('B')).toEqual([]);
  });

  it('uses cache on subsequent calls', () => {
    const first = service.getEffectivePermissions('C');
    service.setParentRole('A', null); // modify hierarchy after caching
    const second = service.getEffectivePermissions('C');
    expect(first).toEqual(second);
  });

it('removes parent role relationship', () => {
  service.removeParentRole('B');
  expect(service.getAncestorRoles('B')).toEqual([]);
});

it('provides full hierarchy tree', () => {
  const tree = service.getRoleHierarchy();
  expect(tree[0].id).toBe('A');
  expect(tree[0].children[0].id).toBe('B');
  expect(tree[0].children[0].children[0].id).toBe('C');
});

it('validateHierarchy enforces depth limits', () => {
  service.addRole({ id: 'D', permissionIds: ['p5'], parentRoleId: 'C' });
  expect(() => service.validateHierarchy(3)).toThrow('Role hierarchy depth limit exceeded');
});

it('validateHierarchy detects circular references', () => {
  const map = (service as any).roles as Map<string, any>;
  map.get('A')!.parentRoleId = 'C';
  expect(() => service.validateHierarchy()).toThrow('Circular role hierarchy');
});
});
