// @vitest-environment jsdom
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TwoFactorSetup } from '@/ui/headless/two-factor/TwoFactorSetup';

vi.mock('@/hooks/auth/useMFA', () => ({
  useMFA: vi.fn()
}));

import { useMFA } from '@/hooks/auth/useMFA';

describe('TwoFactorSetup', () => {
  it('calls setup and verify functions', async () => {
    const setup = vi.fn().mockResolvedValue({ success: true, secret: 's', qrCode: 'q' });
    const verify = vi.fn().mockResolvedValue({ success: true, backupCodes: ['a'] });
    (useMFA as unknown as vi.Mock).mockReturnValue({ setupMFA: setup, verifyMFA: verify, isLoading: false, error: null });
    const onComplete = vi.fn();
    let handlers: any;
    render(
      <TwoFactorSetup onComplete={onComplete}>
        {(props) => {
          handlers = props; return <div />;
        }}
      </TwoFactorSetup>
    );
    await act(async () => { await handlers.start(); });
    expect(setup).toHaveBeenCalled();
    await act(async () => { await handlers.verify('123456'); });
    expect(verify).toHaveBeenCalledWith('123456');
    expect(onComplete).toHaveBeenCalledWith(['a']);
  });
});
