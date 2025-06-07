// @vitest-environment jsdom
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, Mock } from 'vitest';
import { TwoFactorStatus } from '@/ui/headless/two-factor/TwoFactorStatus';

vi.mock('@/lib/stores/2fa.store', () => ({
  use2FAStore: vi.fn()
}));

import { use2FAStore } from '@/lib/stores/2fa.store';

describe('TwoFactorStatus', () => {
  it('calls disable and fetches backup codes', async () => {
    const onDisable = vi.fn().mockResolvedValue(undefined);
    const generate = vi.fn().mockResolvedValue(['code1']);
    (use2FAStore as unknown as Mock).mockReturnValue({ generateBackupCodes: generate });
    let handlers: any;
    render(
      <TwoFactorStatus isEnabled loading={false} error={null} onDisable={onDisable}>
        {(props) => {
          handlers = props;
          return <div />;
        }}
      </TwoFactorStatus>
    );
    await act(async () => {
      await handlers.handleDisable();
    });
    expect(onDisable).toHaveBeenCalled();
    await act(async () => {
      await handlers.handleViewBackupCodes();
    });
    expect(generate).toHaveBeenCalled();
  });
});
