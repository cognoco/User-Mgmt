import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';
import { getServiceSupabase } from '@/lib/database/supabase';

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
    update: vi.fn().mockReturnThis(),
    eq: vi.fn(),
    single: vi.fn(),
  };

  return {
    getServiceSupabase: vi.fn().mockReturnValue(mockSupabaseClient),
  };
});

describe('Domain Verification Initiate API', () => {
  const mockUserId = 'user-123';
  const mockCompanyId = 'company-123';
  const mockDomainId = 'domain-123';
  const mockDomain = 'example.com';
  
  const mockUser = { id: mockUserId };
  const mockDomainRecord = { 
    id: mockDomainId, 
    company_id: mockCompanyId, 
    domain: mockDomain,
    is_verified: false,
    verification_method: 'dns_txt'
  };
  
  let supabase: any;
  
  beforeEach(() => {
    supabase = getServiceSupabase();
    
    // Reset all mocks
    vi.resetAllMocks();
    
    // Set up default responses
    supabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    
    // Mock Supabase responses
    supabase.from.mockReturnThis();
    supabase.select.mockReturnThis();
    supabase.update.mockReturnThis();
    supabase.eq.mockReturnThis();
    
    // Set up default domain response
    supabase.single.mockResolvedValue({
      data: mockDomainRecord,
      error: null
    });
    
    // Setup update response
    supabase.update.mockImplementation(() => ({
      eq: vi.fn().mockResolvedValue({
        data: { updated: true },
        error: null
      })
    }));
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('initiates domain verification successfully', async () => {
    const request = new NextRequest(
      new URL(`http://localhost/api/company/domains/${mockDomainId}/verify-initiate`)
    );
    
    const response = await POST(request, { params: { id: mockDomainId } });
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('verificationToken');
    expect(data.domain).toBe(mockDomain);
    expect(data.message).toContain('verification initiated');
    
    // Verify Supabase calls
    expect(supabase.from).toHaveBeenCalledWith('company_domains');
    expect(supabase.select).toHaveBeenCalled();
    expect(supabase.update).toHaveBeenCalled();
    expect(supabase.eq).toHaveBeenCalledWith('id', mockDomainId);
  });
  
  test('returns 401 for unauthenticated requests', async () => {
    // Mock authentication failure
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: { message: 'Invalid token' } });
    
    const request = new NextRequest(
      new URL(`http://localhost/api/company/domains/${mockDomainId}/verify-initiate`)
    );
    
    const response = await POST(request, { params: { id: mockDomainId } });
    expect(response.status).toBe(401);
    
    const data = await response.json();
    expect(data.error).toBeDefined();
  });
  
  test('returns 404 if domain does not exist', async () => {
    // Mock domain not found
    supabase.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Domain not found' }
    });
    
    const request = new NextRequest(
      new URL(`http://localhost/api/company/domains/${mockDomainId}/verify-initiate`)
    );
    
    const response = await POST(request, { params: { id: mockDomainId } });
    expect(response.status).toBe(404);
    
    const data = await response.json();
    expect(data.error).toContain('not found');
  });
  
  test('returns 403 if user does not have permission to verify the domain', async () => {
    // Mock domain record from another company
    supabase.single.mockImplementationOnce(() => {
      return Promise.resolve({
        data: {
          ...mockDomainRecord,
          user_id: 'different-user-id'
        },
        error: null
      });
    });
    
    const request = new NextRequest(
      new URL(`http://localhost/api/company/domains/${mockDomainId}/verify-initiate`)
    );
    
    const response = await POST(request, { params: { id: mockDomainId } });
    expect(response.status).toBe(403);
    
    const data = await response.json();
    expect(data.error).toContain('permission');
  });
  
  test('returns 500 when database update fails', async () => {
    // Mock update failure
    supabase.update.mockImplementationOnce(() => ({
      eq: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      })
    }));
    
    const request = new NextRequest(
      new URL(`http://localhost/api/company/domains/${mockDomainId}/verify-initiate`)
    );
    
    const response = await POST(request, { params: { id: mockDomainId } });
    expect(response.status).toBe(500);
    
    const data = await response.json();
    expect(data.error).toBeDefined();
  });
  
  test('generated verification token follows expected format', async () => {
    const request = new NextRequest(
      new URL(`http://localhost/api/company/domains/${mockDomainId}/verify-initiate`)
    );
    
    const response = await POST(request, { params: { id: mockDomainId } });
    const data = await response.json();
    
    // Token should be a string and match expected pattern
    expect(typeof data.verificationToken).toBe('string');
    expect(data.verificationToken.length).toBeGreaterThan(10);
    expect(data.verificationToken).toMatch(/^verificat/);
    
    // Verify the update contains the token
    expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({
      verification_token: data.verificationToken
    }));
  });
}); 