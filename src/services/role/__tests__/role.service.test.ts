import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RoleService } from '../role.service';
import { getServiceSupabase } from '@/lib/database/supabase';

vi.mock('@/lib/database/supabase', () => ({
  getServiceSupabase: vi.fn(() => ({
    from: vi.fn(),
  })),
}));

function mockFrom(returnValue: any) {
  return vi.fn(() => returnValue);
}

describe('RoleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects creating duplicate role names', async () => {
    const supabase = getServiceSupabase();
    const from = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'r1' }, error: null }),
    };
    (supabase.from as any).mockReturnValue(from);
    const service = new RoleService();
    await expect(service.createRole('admin', 'desc')).rejects.toThrow('Role name must be unique');
  });

  it('prevents deleting system roles', async () => {
    const supabase = getServiceSupabase();
    const fromFirst = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'r1', is_system_role: true }, error: null }),
    };
    const fromSecond = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    };
    (supabase.from as any)
      .mockReturnValueOnce(fromFirst)
      .mockReturnValueOnce(fromSecond);
    const service = new RoleService();
    await expect(service.deleteRole('r1')).rejects.toThrow('Cannot delete system role');
  });

  it('detects circular hierarchy on update', async () => {
    const supabase = getServiceSupabase();
    // unique name check
    const nameCheck = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      single: vi.fn().mockRejectedValue({ code: 'PGRST116' }),
    };
    // circular check: parent role's parent is the role itself
    const parentQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { parent_role_id: 'r1' }, error: null }),
    };
    (supabase.from as any)
      .mockReturnValueOnce(nameCheck)
      .mockReturnValueOnce(parentQuery);
    const service = new RoleService();
    await expect(service.updateRole('r1', { parentRoleId: 'r2' })).rejects.toThrow('Circular role hierarchy');
  });
});
