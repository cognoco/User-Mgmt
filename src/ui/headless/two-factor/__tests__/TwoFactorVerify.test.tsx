// @vitest-environment jsdom
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TwoFactorVerify } from '@/ui/headless/two-factor/TwoFactorVerify';

vi.mock('@/hooks/auth/useMFA', () => ({
  useMFA: vi.fn()
}));

import { useMFA } from '@/hooks/auth/useMFA';

describe('TwoFactorVerify', () => {
  it('submits code for verification', async () => {
    const verify = vi.fn().mockResolvedValue({ success: true });
    (useMFA as unknown as vi.Mock).mockReturnValue({ verifyMFA: verify, isLoading: false, error: null });
    const onSuccess = vi.fn();
    let handlers: any;
    render(
      <TwoFactorVerify onSuccess={onSuccess}>
        {(props) => { handlers = props; return <div />; }}
      </TwoFactorVerify>
    );
    await act(async () => { handlers.setCode('111111'); });
    await act(async () => { await handlers.submit(); });
    expect(verify).toHaveBeenCalledWith('111111');
    expect(onSuccess).toHaveBeenCalled();
  });
});
