import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '../route';
import { getServiceSupabase } from '@/adapters/database/supabase-provider';

// Mock Supabase client
vi.mock('@/lib/database/supabase', () => ({
  getServiceSupabase: vi.fn(() => ({
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          maybeSingle: vi.fn()
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn()
      }))
    }))
  }))
}));

// Mock rate limiter
vi.mock('@/middleware/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve(false))
}));

describe('Company Profile API', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com'
  };

  const mockProfile = {
    id: 'test-profile-id',
    name: 'Test Company',
    legal_name: 'Test Company Legal',
    industry: 'Technology',
    size_range: '11-50' as const,
    founded_year: 2020,
    status: 'pending' as const,
    verified: false,
    user_id: mockUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/company/profile', () => {
    it('should create a new company profile', async () => {
      const supabase = getServiceSupabase();
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });
      (supabase.from('company_profiles').select().eq('user_id', mockUser.id).single as any)
        .mockResolvedValue({ data: null, error: null });
      (supabase.from('company_profiles').insert().select().single as any)
        .mockResolvedValue({ data: mockProfile, error: null });

      const request = new NextRequest('http://localhost/api/company/profile', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer test-token',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          name: mockProfile.name,
          legal_name: mockProfile.legal_name,
          industry: mockProfile.industry,
          size_range: mockProfile.size_range,
          founded_year: mockProfile.founded_year
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProfile);
    });

    it('should return 401 if not authenticated', async () => {
      const request = new NextRequest('http://localhost/api/company/profile', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        }
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/company/profile', () => {
    it('should return the company profile', async () => {
      const supabase = getServiceSupabase();
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });
      (supabase.from('company_profiles').select('*').eq('user_id', mockUser.id).single as any)
        .mockResolvedValue({ data: mockProfile, error: null });

      const request = new NextRequest('http://localhost/api/company/profile', {
        method: 'GET',
        headers: {
          'authorization': 'Bearer test-token'
        }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProfile);
    });

    it('should return 404 if profile not found', async () => {
      const supabase = getServiceSupabase();
      (supabase.auth.getUser as any).mockResolvedValue({ data: { user: mockUser }, error: null });
      (supabase.from('company_profiles').select('*').eq('user_id', mockUser.id).single as any)
        .mockResolvedValue({ 
          data: null, 
          error: { code: 'PGRST116' } 
        });

      const request = new NextRequest('http://localhost/api/company/profile', {
        method: 'GET',
        headers: {
          'authorization': 'Bearer test-token'
        }
      });

      const response = await GET(request);
      expect(response.status).toBe(404);
    });
  });
}); 