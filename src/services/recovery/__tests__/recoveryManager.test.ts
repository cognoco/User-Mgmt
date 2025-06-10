import { describe, it, expect, vi } from 'vitest';
import { RecoveryManager } from '@/services/recovery/recoveryManager';

describe('RecoveryManager', () => {
  it('executes registered recovery task', async () => {
    const mgr = new RecoveryManager();
    const fn = vi.fn().mockResolvedValue(undefined);
    mgr.register('svc', fn);
    await mgr.trigger('svc');
    expect(fn).toHaveBeenCalled();
  });
});
