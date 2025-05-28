import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextResponse } from 'next/server';
import { POST, GET } from '../route';
import { getServiceSupabase } from '@/lib/database/supabase';
import { withRouteAuth } from '@/middleware/auth';
import { createAuthenticatedRequest } from '@/tests/utils/request-helpers';

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

vi.mock('@/middleware/auth', () => ({
  withRouteAuth: vi.fn((handler: any) => async (req: any) => handler(req, { userId: 'test-user-id', role: 'user' })),
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

      const request = createAuthenticatedRequest('POST', 'http://localhost/api/company/profile', {
        name: mockProfile.name,
        legal_name: mockProfile.legal_name,
        industry: mockProfile.industry,
        size_range: mockProfile.size_range,
        founded_year: mockProfile.founded_year,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockProfile);
    });

    it('should return 401 if not authenticated', async () => {
      vi.mocked(withRouteAuth).mockResolvedValueOnce(
        new NextResponse('unauthorized', { status: 401 })
      );

      const request = createAuthenticatedRequest('POST', 'http://localhost/api/company/profile', {});

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

      const request = createAuthenticatedRequest('GET', 'http://localhost/api/company/profile');

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

      const request = createAuthenticatedRequest('GET', 'http://localhost/api/company/profile');

      const response = await GET(request);
      expect(response.status).toBe(404);
    });
  });
}); 