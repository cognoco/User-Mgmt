import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';
import { getServiceSupabase } from '@/adapters/database/supabase-provider';
import dns from 'dns/promises';

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

// Mock DNS lookup
vi.mock('dns/promises', () => ({
  default: {
    resolveTxt: vi.fn()
  }
}));

describe('Domain Verification Check API', () => {
  const mockUserId = 'user-123';
  const mockCompanyId = 'company-123';
  const mockDomainId = 'domain-123';
  const mockDomain = 'example.com';
  const mockToken = 'verification-token-123';
  
  const mockUser = { id: mockUserId };
  const mockDomainRecord = { 
    id: mockDomainId, 
    company_id: mockCompanyId, 
    domain: mockDomain,
    is_verified: false,
    verification_token: mockToken,
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
    
    // Mock DNS resolveTxt to return matching verification token
    (dns.resolveTxt as any).mockResolvedValue([[mockToken]]);
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('verifies domain successfully when token is found in DNS records', async () => {
    const request = new NextRequest(
      new URL(`http://localhost/api/company/domains/${mockDomainId}/verify-check`)
    );
    
    const response = await POST(request, { params: { id: mockDomainId } });
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.verified).toBe(true);
    expect(data.message).toContain('verified');
    
    // Verify DNS lookup was called correctly
    expect(dns.resolveTxt).toHaveBeenCalledWith(mockDomain);
    
    // Verify Supabase calls
    expect(supabase.from).toHaveBeenCalledWith('company_domains');
    expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({
      is_verified: true,
      verification_date: expect.any(String),
      last_checked: expect.any(String)
    }));
  });
  
  test('returns 401 for unauthenticated requests', async () => {
    // Mock authentication failure
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: { message: 'Invalid token' } });
    
    const request = new NextRequest(
      new URL(`http://localhost/api/company/domains/${mockDomainId}/verify-check`)
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
      new URL(`http://localhost/api/company/domains/${mockDomainId}/verify-check`)
    );
    
    const response = await POST(request, { params: { id: mockDomainId } });
    expect(response.status).toBe(404);
    
    const data = await response.json();
    expect(data.error).toContain('not found');
  });
  
  test('returns 400 if verification has not been initiated', async () => {
    // Mock domain without verification token
    supabase.single.mockResolvedValueOnce({
      data: {
        ...mockDomainRecord,
        verification_token: null
      },
      error: null
    });
    
    const request = new NextRequest(
      new URL(`http://localhost/api/company/domains/${mockDomainId}/verify-check`)
    );
    
    const response = await POST(request, { params: { id: mockDomainId } });
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toContain('not been initiated');
  });
  
  test('returns unverified status when token is not found in DNS records', async () => {
    // Mock DNS not finding the token
    (dns.resolveTxt as any).mockResolvedValueOnce([['different-token']]);
    
    const request = new NextRequest(
      new URL(`http://localhost/api/company/domains/${mockDomainId}/verify-check`)
    );
    
    const response = await POST(request, { params: { id: mockDomainId } });
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.verified).toBe(false);
    expect(data.message).toContain('not found');
    
    // Verify DNS lookup was called
    expect(dns.resolveTxt).toHaveBeenCalledWith(mockDomain);
    
    // Verify domain is marked as not verified in the database
    expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({
      is_verified: false,
      last_checked: expect.any(String)
    }));
  });
  
  test('handles DNS resolution errors correctly', async () => {
    // Mock DNS resolution error
    (dns.resolveTxt as any).mockRejectedValueOnce({ code: 'ENOTFOUND' });
    
    const request = new NextRequest(
      new URL(`http://localhost/api/company/domains/${mockDomainId}/verify-check`)
    );
    
    const response = await POST(request, { params: { id: mockDomainId } });
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.verified).toBe(false);
    expect(data.message).toContain('No TXT records found');
    
    // Verify DNS lookup was called
    expect(dns.resolveTxt).toHaveBeenCalledWith(mockDomain);
  });
  
  test('handles unexpected DNS errors gracefully', async () => {
    // Mock unexpected DNS error
    (dns.resolveTxt as any).mockRejectedValueOnce(new Error('Unexpected DNS error'));
    
    const request = new NextRequest(
      new URL(`http://localhost/api/company/domains/${mockDomainId}/verify-check`)
    );
    
    const response = await POST(request, { params: { id: mockDomainId } });
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.verified).toBe(false);
    expect(data.message).toContain('error occurred');
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
      new URL(`http://localhost/api/company/domains/${mockDomainId}/verify-check`)
    );
    
    const response = await POST(request, { params: { id: mockDomainId } });
    expect(response.status).toBe(500);
    
    const data = await response.json();
    expect(data.error).toBeDefined();
  });
}); 