import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { GET, POST, DELETE, PATCH } from '../route';
import { getServiceSupabase } from '@/lib/database/supabase';
import { withRouteAuth } from '@/middleware/auth';
import { z } from 'zod';
import { createAuthenticatedRequest } from '@/tests/utils/request-helpers';

// Mock dependencies
vi.mock('@/middleware/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue(false)
}));

vi.mock('@/lib/database/supabase', () => {
  // Mock Supabase client for service role
  const mockSupabaseClient = {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
    single: vi.fn(),
    in: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
  };

  return {
    getServiceSupabase: vi.fn().mockReturnValue(mockSupabaseClient),
  };
});

vi.mock('@/middleware/auth', () => ({
  withRouteAuth: vi.fn((handler: any, req: any) => handler(req, { userId: 'user-123' })),
}));

// Mock Zod schema (used in the routes)
vi.mock('zod', () => {
  const safeParse = vi.fn();
  const object = vi.fn().mockReturnValue({ safeParse });
  const string = vi.fn().mockReturnValue({ safeParse });
  const boolean = vi.fn().mockReturnValue({ safeParse });
  const uuid = vi.fn().mockReturnValue({ safeParse });

  return {
    z: {
      object,
      string: () => ({
        min: () => ({
          max: () => ({
            regex: () => string
          })
        })
      }),
      boolean: () => boolean,
      uuid: () => uuid,
      safeParse,
    }
  };
});

// Mock DNS resolution for TXT verification
vi.mock('dns/promises', () => ({
  default: {
    resolveTxt: vi.fn()
  }
}));

describe('Company Domains API', () => {
  const mockUserId = 'user-123';
  const mockCompanyId = 'company-123';
  const mockDomainId = 'domain-123';
  const mockDomain = 'example.com';
  
  const mockUser = { id: mockUserId };
  const mockCompanyProfile = { id: mockCompanyId, user_id: mockUserId };
  
  let supabase: any;
  
  beforeEach(() => {
    supabase = getServiceSupabase();
    
    // Reset all mocks
    vi.resetAllMocks();
    
    // Set up default responses
    supabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    
    // Mock schema validation
    (z as any).safeParse.mockReturnValue({ success: true, data: { domain: mockDomain, companyId: mockCompanyId } });
    
    // Mock Supabase responses
    supabase.from.mockReturnThis();
    supabase.select.mockReturnThis();
    supabase.insert.mockReturnThis();
    supabase.update.mockReturnThis();
    supabase.delete.mockReturnThis();
    supabase.eq.mockReturnThis();
    supabase.maybeSingle.mockResolvedValue({ data: null, error: null });
    supabase.single.mockImplementation(() => {
      return Promise.resolve({
        data: mockCompanyProfile,
        error: null
      });
    });
    
    // Set up default domain response
    supabase.select.mockImplementation(() => {
      const count = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      });

      return {
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        single: vi.fn().mockResolvedValue({ data: mockCompanyProfile, error: null }),
        count
      };
    });
    
    // Set up insert response
    supabase.insert.mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          id: mockDomainId,
          company_id: mockCompanyId,
          domain: mockDomain,
          is_primary: true,
          is_verified: false,
          verification_method: 'dns_txt',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        error: null
      })
    }));
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/company/domains', () => {
    test('returns company domains successfully', async () => {
      // Mock specific response for the GET request
      supabase.select.mockImplementationOnce(() => ({
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: [
            {
              id: mockDomainId,
              company_id: mockCompanyId,
              domain: mockDomain,
              is_primary: true,
              is_verified: false,
              verification_method: 'dns_txt'
            }
          ],
          error: null
        })
      }));

      const request = createAuthenticatedRequest(
        'GET',
        'http://localhost/api/company/domains?companyId=' + mockCompanyId
      );

      const response = await GET(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveLength(1);
      expect(data[0].domain).toBe(mockDomain);
      expect(data[0].is_verified).toBe(false);
      
      expect(supabase.from).toHaveBeenCalledWith('company_domains');
      expect(supabase.select).toHaveBeenCalled();
    });
    
    test('returns 401 for unauthenticated requests', async () => {
      vi.mocked(withRouteAuth).mockImplementationOnce(() =>
        new NextResponse(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      );

      const request = createAuthenticatedRequest(
        'GET',
        'http://localhost/api/company/domains?companyId=' + mockCompanyId
      );

      const response = await GET(request);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBeDefined();
    });
    
    test('returns 400 if companyId is missing', async () => {
      const request = createAuthenticatedRequest('GET', 'http://localhost/api/company/domains');
      
      const response = await GET(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
    
    test('returns empty array if no domains exist', async () => {
      // Mock empty domains response
      supabase.select.mockImplementationOnce(() => ({
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        in: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      }));
      
      const request = createAuthenticatedRequest(
        'GET',
        'http://localhost/api/company/domains?companyId=' + mockCompanyId
      );
      
      const response = await GET(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(0);
    });
  });

  describe('POST /api/company/domains', () => {
    test('adds a new domain successfully', async () => {
      const requestBody = { domain: mockDomain, companyId: mockCompanyId };
      
      const request = createAuthenticatedRequest(
        'POST',
        'http://localhost/api/company/domains',
        requestBody
      );
      
      const response = await POST(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.domain).toBe(mockDomain);
      expect(data.company_id).toBe(mockCompanyId);
      expect(data.is_verified).toBe(false);
      
      expect(supabase.from).toHaveBeenCalledWith('company_domains');
      expect(supabase.insert).toHaveBeenCalled();
    });
    
    test('returns 400 for invalid domain format', async () => {
      // Mock validation failure
      (z as any).safeParse.mockReturnValueOnce({
        success: false,
        error: {
          format: () => ({
            domain: {
              _errors: ['Invalid domain format']
            }
          })
        }
      });
      
      const requestBody = { domain: 'invalid-domain', companyId: mockCompanyId };
      
      const request = createAuthenticatedRequest(
        'POST',
        'http://localhost/api/company/domains',
        requestBody
      );
      
      const response = await POST(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBeDefined();
      expect(data.details).toBeDefined();
    });
    
    test('returns 400 if domain already exists for company', async () => {
      // Mock existing domain response
      supabase.maybeSingle.mockResolvedValueOnce({
        data: { id: 'existing-domain-123', domain: mockDomain },
        error: null
      });
      
      const requestBody = { domain: mockDomain, companyId: mockCompanyId };
      
      const request = createAuthenticatedRequest(
        'POST',
        'http://localhost/api/company/domains',
        requestBody
      );
      
      const response = await POST(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('This domain already exists for your company.');
    });
    
    test('returns 403 if user does not have permission to add domains', async () => {
      // Mock company profile not found for this user
      supabase.single.mockRejectedValueOnce({
        data: null,
        error: { message: 'Not found' }
      });
      
      const requestBody = { domain: mockDomain, companyId: mockCompanyId };
      
      const request = createAuthenticatedRequest(
        'POST',
        'http://localhost/api/company/domains',
        requestBody
      );
      
      const response = await POST(request);
      expect(response.status).toBe(403);
      
      const data = await response.json();
      expect(data.error).toContain('permission');
    });
  });
  
  describe('DELETE /api/company/domains/{id}', () => {
    test('deletes a domain successfully', async () => {
      // Mock delete response
      supabase.delete.mockImplementationOnce(() => ({
        eq: vi.fn().mockResolvedValue({
          data: { deleted: true },
          error: null
        })
      }));
      
      const request = createAuthenticatedRequest(
        'DELETE',
        `http://localhost/api/company/domains/${mockDomainId}`
      );
      
      const response = await DELETE(request, { params: { id: mockDomainId } });
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.message).toContain('successfully');
      
      expect(supabase.from).toHaveBeenCalledWith('company_domains');
      expect(supabase.delete).toHaveBeenCalled();
    });
    
    test('returns 404 if domain does not exist', async () => {
      // Mock domain not found response
      supabase.delete.mockImplementationOnce(() => ({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' }
        })
      }));
      
      const request = createAuthenticatedRequest(
        'DELETE',
        `http://localhost/api/company/domains/${mockDomainId}`
      );
      
      const response = await DELETE(request, { params: { id: mockDomainId } });
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });
  
  describe('PATCH /api/company/domains/{id}', () => {
    test('updates domain properties successfully', async () => {
      // Mock update response
      supabase.update.mockImplementationOnce(() => ({
        eq: vi.fn().mockResolvedValue({
          data: { updated: true },
          error: null
        })
      }));
      
      const requestBody = { is_primary: true };
      
      const request = createAuthenticatedRequest(
        'PATCH',
        `http://localhost/api/company/domains/${mockDomainId}`,
        requestBody
      );
      
      const response = await PATCH(request, { params: { id: mockDomainId } });
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.message).toContain('updated');
      
      expect(supabase.from).toHaveBeenCalledWith('company_domains');
      expect(supabase.update).toHaveBeenCalled();
    });
    
    test('updates other domains when setting a new primary domain', async () => {
      // Mock update implementation to handle dual updates
      let updateCallCount = 0;
      let updatePrimaryCallParams: any = null;
      
      supabase.update.mockImplementation((params: any) => {
        updateCallCount++;
        if (updateCallCount === 1) {
          // First call - updating the specific domain
          updatePrimaryCallParams = params;
          return {
            eq: vi.fn().mockResolvedValue({
              data: { updated: true },
              error: null
            })
          };
        } else {
          // Second call - updating other domains to not be primary
          return {
            eq: vi.fn().mockReturnThis(),
            neq: vi.fn().mockResolvedValue({
              data: { updated: true },
              error: null
            })
          };
        }
      });
      
      const requestBody = { is_primary: true };
      
      const request = createAuthenticatedRequest(
        'PATCH',
        `http://localhost/api/company/domains/${mockDomainId}`,
        requestBody
      );
      
      const response = await PATCH(request, { params: { id: mockDomainId } });
      expect(response.status).toBe(200);
      
      // Check that the appropriate update calls were made
      expect(updateCallCount).toBe(2);
      expect(updatePrimaryCallParams).toEqual({ is_primary: true, updated_at: expect.any(String) });
    });
    
    test('returns 404 if domain does not exist', async () => {
      // Mock domain not found for update
      supabase.update.mockImplementationOnce(() => ({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' }
        })
      }));
      
      const requestBody = { is_primary: true };
      
      const request = createAuthenticatedRequest(
        'PATCH',
        `http://localhost/api/company/domains/${mockDomainId}`,
        requestBody
      );
      
      const response = await PATCH(request, { params: { id: mockDomainId } });
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });
}); 