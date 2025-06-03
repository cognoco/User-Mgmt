import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResourcePermissionResolver } from '../resource-permission-resolver.service';
import { getServiceSupabase } from '@/lib/database/supabase';

const supabase = { from: vi.fn() };
vi.mock('@/lib/database/supabase', () => ({
  getServiceSupabase: vi.fn(() => supabase),
}));

function permQuery(perms: string[]) {
  const obj: any = {};
  obj.select = vi.fn(() => obj);
  obj.eq = vi.fn(() => obj);
  obj.then = (resolve: any) =>
    Promise.resolve({ data: perms.map(p => ({ permission: p })), error: null }).then(resolve);
  return obj;
}

function relQuery(parent: { type: string; id: string } | null) {
  const obj: any = {};
  obj.select = vi.fn(() => obj);
  obj.eq = vi.fn(() => obj);
  obj.single = vi.fn().mockResolvedValue(
    parent
      ? { data: { parent_type: parent.type, parent_id: parent.id }, error: null }
      : { data: null, error: null },
  );
  return obj;
}

describe('ResourcePermissionResolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.from.mockReset();
  });

  it('returns ancestor chain', async () => {
    (supabase.from as any)
      .mockReturnValueOnce(relQuery({ type: 'team', id: 't1' }))
      .mockReturnValueOnce(relQuery(null));
    const resolver = new ResourcePermissionResolver();
    const ancestors = await resolver.getResourceAncestors('project', 'p1');
    expect(ancestors).toEqual([{ type: 'team', id: 't1', relationshipType: undefined }]);
  });

  it('combines permissions from ancestors', async () => {
    (supabase.from as any)
      // direct permissions
      .mockReturnValueOnce(permQuery(['p1']))
      // ancestor permissions first ancestor
      .mockReturnValueOnce(relQuery({ type: 'team', id: 't1' }))
      .mockReturnValueOnce(permQuery(['p2']))
      // second ancestor none
      .mockReturnValueOnce(relQuery(null));

    const resolver = new ResourcePermissionResolver();
    const perms = await resolver.getEffectivePermissions('u1', 'project', 'p1');
    expect(perms.sort()).toEqual(['p1', 'p2']);
  });
});
