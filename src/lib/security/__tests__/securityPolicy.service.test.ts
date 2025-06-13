import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getOrganizationPolicy,
  isMfaRequiredForUser,
  getAllowedMfaMethods,
  getSessionTimeout,
  getMaxSessionsPerUser,
  validatePasswordAgainstOrgPolicy,
  hasPasswordExpired,
  isIpAllowed,
  requiresReauthForAction
} from '../securityPolicy.service';
import { setTableMockData, resetSupabaseMock } from '@/tests/mocks/supabase';
import { DEFAULT_SECURITY_POLICY } from '@/types/organizations';

describe('securityPolicy.service', () => {
  beforeEach(() => {
    resetSupabaseMock();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fetches organization policy and merges defaults', async () => {
    setTableMockData('organizations', {
      data: { id: 'org1', security_settings: { password_min_length: 12 } },
      error: null
    });
    const policy = await getOrganizationPolicy('org1');
    expect(policy?.password_min_length).toBe(12);
    expect(policy?.max_sessions_per_user).toBe(DEFAULT_SECURITY_POLICY.max_sessions_per_user);
  });

  it('checks MFA requirement for user', async () => {
    setTableMockData('organizations', {
      data: { id: 'org1', security_settings: { ...DEFAULT_SECURITY_POLICY, require_mfa: true } },
      error: null
    });
    const result = await isMfaRequiredForUser('u1', 'org1');
    expect(result).toBe(true);
  });

  it('gets allowed MFA methods', async () => {
    setTableMockData('organizations', {
      data: { id: 'org1', security_settings: { ...DEFAULT_SECURITY_POLICY, allowed_mfa_methods: ['email'] } },
      error: null
    });
    const result = await getAllowedMfaMethods('org1');
    expect(result).toEqual(['email']);
  });

  it('returns session timeout and max sessions', async () => {
    setTableMockData('organizations', {
      data: {
        id: 'org1',
        security_settings: { ...DEFAULT_SECURITY_POLICY, session_timeout_mins: 5, max_sessions_per_user: 2 }
      },
      error: null
    });
    expect(await getSessionTimeout('org1')).toBe(5);
    expect(await getMaxSessionsPerUser('org1')).toBe(2);
  });

  it('validates password against org policy', async () => {
    setTableMockData('organizations', {
      data: { id: 'org1', security_settings: { ...DEFAULT_SECURITY_POLICY, password_min_length: 4 } },
      error: null
    });
    const result = await validatePasswordAgainstOrgPolicy('abc', 'org1');
    expect(result.isValid).toBe(false);
  });

  it('checks password expiry', async () => {
    setTableMockData('organizations', {
      data: { id: 'org1', security_settings: { ...DEFAULT_SECURITY_POLICY, password_expiry_days: 30 } },
      error: null
    });
    setTableMockData('user_profiles', {
      data: { last_password_change: '2023-01-01T00:00:00Z' },
      error: null
    });
    vi.setSystemTime(new Date('2023-02-05T00:00:00Z'));
    const result = await hasPasswordExpired('user1', 'org1');
    expect(result).toBe(true);
  });

  it('checks IP allow and deny lists', async () => {
    setTableMockData('organizations', {
      data: {
        id: 'org1',
        security_settings: {
          ...DEFAULT_SECURITY_POLICY,
          ip_allowlist_enabled: true,
          ip_allowlist: ['1.1.1.1'],
          ip_denylist: ['2.2.2.2']
        }
      },
      error: null
    });
    expect(await isIpAllowed('1.1.1.1', 'org1')).toBe(true);
    expect(await isIpAllowed('2.2.2.2', 'org1')).toBe(false);
    expect(await isIpAllowed('3.3.3.3', 'org1')).toBe(false);
  });

  it('checks if action requires reauth', async () => {
    setTableMockData('organizations', {
      data: {
        id: 'org1',
        security_settings: {
          ...DEFAULT_SECURITY_POLICY,
          require_reauth_for_sensitive: true,
          sensitive_actions: ['delete_account']
        }
      },
      error: null
    });
    const result = await requiresReauthForAction('delete_account', 'org1');
    expect(result).toBe(true);
  });

  it('handles missing organization policy', async () => {
    setTableMockData('organizations', { data: { id: 'org1' }, error: null });
    const policy = await getOrganizationPolicy('org1');
    expect(policy).toEqual(DEFAULT_SECURITY_POLICY);
  });

  it('returns null when organization fetch fails', async () => {
    setTableMockData('organizations', { data: null, error: { message: 'fail' } });
    const policy = await getOrganizationPolicy('org1');
    expect(policy).toBeNull();
    const mfa = await isMfaRequiredForUser('u1', 'org1');
    expect(mfa).toBe(false);
  });

  it('falls back when policy not found for other helpers', async () => {
    setTableMockData('organizations', { data: null, error: null });
    expect(await getAllowedMfaMethods('org1')).toEqual(['totp', 'sms', 'email']);
    expect(await getSessionTimeout('org1')).toBe(DEFAULT_SECURITY_POLICY.session_timeout_mins);
    expect(await getMaxSessionsPerUser('org1')).toBe(DEFAULT_SECURITY_POLICY.max_sessions_per_user);
    const result = await validatePasswordAgainstOrgPolicy('weak', 'org1');
    expect(result.isValid).toBe(false);
  });

  it('returns false when password expiry disabled or error fetching profile', async () => {
    setTableMockData('organizations', {
      data: { id: 'org1', security_settings: { ...DEFAULT_SECURITY_POLICY, password_expiry_days: 0 } },
      error: null
    });
    const noExpiry = await hasPasswordExpired('user1', 'org1');
    expect(noExpiry).toBe(false);
    setTableMockData('organizations', {
      data: { id: 'org1', security_settings: { ...DEFAULT_SECURITY_POLICY, password_expiry_days: 30 } },
      error: null
    });
    setTableMockData('user_profiles', { data: null, error: { message: 'oops' } });
    const onError = await hasPasswordExpired('user1', 'org1');
    expect(onError).toBe(false);
  });

  it('allows ip when allowlist disabled or policy missing', async () => {
    setTableMockData('organizations', { data: { id: 'org1', security_settings: { ...DEFAULT_SECURITY_POLICY, ip_allowlist_enabled: false } }, error: null });
    expect(await isIpAllowed('4.4.4.4', 'org1')).toBe(true);
    setTableMockData('organizations', { data: null, error: null });
    expect(await isIpAllowed('4.4.4.4', 'org1')).toBe(true);
  });

  it('returns false when action not sensitive', async () => {
    setTableMockData('organizations', {
      data: { id: 'org1', security_settings: { ...DEFAULT_SECURITY_POLICY, require_reauth_for_sensitive: true, sensitive_actions: ['delete_account'] } },
      error: null
    });
    const result = await requiresReauthForAction('update_profile', 'org1');
    expect(result).toBe(false);
  });
});
