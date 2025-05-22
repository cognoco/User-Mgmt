import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '../route';
import { getServiceSupabase } from '@/lib/database/supabase';
import { createSupabaseAddressProvider } from '@/adapters/address/factory';

// Mock Supabase client
vi.mock('@/lib/database/supabase', () => ({
  getServiceSupabase: vi.fn(() => ({
    auth: { getUser: vi.fn() },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn((column: string, { ascending }: { ascending: boolean }) => ({ ascending }))
        }))
      }))
    }))
  }))
}));

// Mock address provider factory
vi.mock('@/adapters/address/factory', () => ({
  createSupabaseAddressProvider: vi.fn(() => ({
    createAddress: vi.fn(),
    getAddresses: vi.fn(),
    updateAddress: vi.fn(),
    deleteAddress: vi.fn()
  }))
}));

// Mock rate limiter
vi.mock('@/middleware/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve(false))
}));

describe('Company Addresses API', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com'
  };

  const mockCompanyProfile = {
    id: 'test-company-id',
    user_id: mockUser.id
  };

  const mockAddress = {
    id: 'test-address-id',
    company_id: mockCompanyProfile.id,
    type: 'billing' as const,
    street_line1: '123 Test St',
    city: 'Test City',
    state: 'Test State',
    postal_code: '12345',
    country: 'US',
    is_primary: true,
    validated: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/company/addresses', () => {
    it('should create a new company address', async () => {
      const supabase = getServiceSupabase();
      const provider = { createAddress: vi.fn(), getAddresses: vi.fn(), updateAddress: vi.fn(), deleteAddress: vi.fn() };
      (createSupabaseAddressProvider as any).mockReturnValue(provider);
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });
      (supabase.from('company_profiles').select('id').eq('user_id', mockUser.id).single as any)
        .mockResolvedValue({ data: mockCompanyProfile, error: null });
      (provider.createAddress as any).mockResolvedValue({ success: true, address: mockAddress });

      const request = new NextRequest('http://localhost/api/company/addresses', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer test-token',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          type: mockAddress.type,
          street_line1: mockAddress.street_line1,
          city: mockAddress.city,
          state: mockAddress.state,
          postal_code: mockAddress.postal_code,
          country: mockAddress.country,
          is_primary: mockAddress.is_primary
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockAddress);
    });

    it('should return 401 if not authenticated', async () => {
      const request = new NextRequest('http://localhost/api/company/addresses', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        }
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it('should return 404 if company profile not found', async () => {
      const supabase = getServiceSupabase();
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });
      (supabase.from('company_profiles').select('id').eq('user_id', mockUser.id).single as any)
        .mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

      const request = new NextRequest('http://localhost/api/company/addresses', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer test-token',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          type: mockAddress.type,
          street_line1: mockAddress.street_line1,
          city: mockAddress.city,
          state: mockAddress.state,
          postal_code: mockAddress.postal_code,
          country: mockAddress.country,
          is_primary: mockAddress.is_primary
        })
      });

      const response = await POST(request);
      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/company/addresses', () => {
    it('should return company addresses', async () => {
      const supabase = getServiceSupabase();
      const provider = { createAddress: vi.fn(), getAddresses: vi.fn(), updateAddress: vi.fn(), deleteAddress: vi.fn() };
      (createSupabaseAddressProvider as any).mockReturnValue(provider);
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });
      (supabase.from('company_profiles').select('id').eq('user_id', mockUser.id).single as any)
        .mockResolvedValue({ data: mockCompanyProfile, error: null });
      (provider.getAddresses as any).mockResolvedValue([mockAddress]);

      const request = new NextRequest('http://localhost/api/company/addresses', {
        method: 'GET',
        headers: {
          'authorization': 'Bearer test-token'
        }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([mockAddress]);
    });

    it('should return 401 if not authenticated', async () => {
      const request = new NextRequest('http://localhost/api/company/addresses', {
        method: 'GET'
      });

      const response = await GET(request);
      expect(response.status).toBe(401);
    });
  });
}); 