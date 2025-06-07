// @vitest-environment jsdom
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TwoFactorDisable } from '@/src/ui/headless/two-factor/TwoFactorDisable'137;

vi.mock('@/hooks/auth/useMFA', () => ({
  useMFA: vi.fn()
}));

import { useMFA } from '@/hooks/auth/useMFA';

describe('TwoFactorDisable', () => {
  it('calls disableMFA with code', async () => {
    const disable = vi.fn().mockResolvedValue({ success: true });
    (useMFA as unknown as vi.Mock).mockReturnValue({ disableMFA: disable, isLoading: false, error: null });
    const onSuccess = vi.fn();
    let handlers: any;
    render(
      <TwoFactorDisable onSuccess={onSuccess}>
        {(props) => { handlers = props; return <div />; }}
      </TwoFactorDisable>
    );
    await act(async () => { handlers.setCode('000000'); });
    await act(async () => { await handlers.submit(); });
    expect(disable).toHaveBeenCalledWith('000000');
    expect(onSuccess).toHaveBeenCalled();
  });
});
