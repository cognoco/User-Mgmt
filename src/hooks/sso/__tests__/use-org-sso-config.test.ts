import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '@/lib/api/axios';
import { useOrgSsoConfig } from '../use-org-sso-config';

vi.mock('@/lib/api/axios', () => ({ api: { get: vi.fn(), put: vi.fn() } }));

const mockGet = api.get as unknown as ReturnType<typeof vi.fn>;
const mockPut = api.put as unknown as ReturnType<typeof vi.fn>;

describe('useOrgSsoConfig', () => {
  const orgId = 'org1';

  beforeEach(() => {
    mockGet.mockReset();
    mockPut.mockReset();
  });

  it('fetches settings', async () => {
    mockGet.mockResolvedValueOnce({ data: { sso_enabled: true, idp_type: 'saml' } });
    const { result } = renderHook(() => useOrgSsoConfig(orgId));
    let settings;
    await act(async () => {
      settings = await result.current.getSettings();
    });
    expect(mockGet).toHaveBeenCalledWith(`/organizations/${orgId}/sso/settings`);
    expect(settings).toEqual({ sso_enabled: true, idp_type: 'saml' });
  });

  it('updates idp config', async () => {
    mockPut.mockResolvedValueOnce({ data: { clientId: 'id' } });
    const { result } = renderHook(() => useOrgSsoConfig(orgId));
    let data;
    await act(async () => {
      data = await result.current.updateIdpConfig('oidc', { clientId: 'id' });
    });
    expect(mockPut).toHaveBeenCalledWith(`/organizations/${orgId}/sso/oidc/config`, { clientId: 'id' });
    expect(data).toEqual({ clientId: 'id' });
  });
});
