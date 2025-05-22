import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { getServiceSupabase } from '@/adapters/database/supabase-provider';
import { checkRateLimit } from '@/middleware/rate-limit';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/database/supabase', () => ({
  getServiceSupabase: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
      resend: vi.fn()
    }
  }))
}));

vi.mock('@/middleware/rate-limit', () => ({
  checkRateLimit: vi.fn()
}));

describe('POST /api/auth/send-verification-email', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    email_confirmed_at: null
  };

  const mockSupabase = {
    auth: {
      getUser: vi.fn(),
      resend: vi.fn()
    }
  };

  const createMockRequest = (options: { headers?: Record<string, string> } = {}) => {
    return new NextRequest('http://localhost:3000/api/auth/send-verification-email', {
      method: 'POST',
      ...options
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getServiceSupabase as any).mockReturnValue(mockSupabase);
    (checkRateLimit as any).mockResolvedValue(false);
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSupabase.auth.resend.mockResolvedValue({ error: null });
  });

  it('should return 429 when rate limited', async () => {
    (checkRateLimit as any).mockResolvedValue(true);

    const request = createMockRequest({
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe('Too many requests');
  });

  it('should return 401 when no authorization header is present', async () => {
    const request = createMockRequest();

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Missing or invalid authorization token');
  });

  it('should return 401 when user is not found', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'User not found' } });

    const request = createMockRequest({
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('User not found');
  });

  it('should return 400 when user has no email', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ 
      data: { user: { ...mockUser, email: null } }, 
      error: null 
    });

    const request = createMockRequest({
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('User email not found.');
  });

  it('should successfully send verification email', async () => {
    const request = createMockRequest({
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Verification email has been sent');
    expect(mockSupabase.auth.resend).toHaveBeenCalledWith({
      type: 'signup',
      email: mockUser.email,
      options: {
        emailRedirectTo: expect.any(String)
      }
    });
  });

  it('should handle Supabase resend error', async () => {
    mockSupabase.auth.resend.mockResolvedValue({ 
      error: { message: 'Failed to send email', status: 400 } 
    });

    const request = createMockRequest({
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Failed to send email');
  });

  it('should handle unexpected errors', async () => {
    mockSupabase.auth.resend.mockRejectedValue(new Error('Unexpected error'));

    const request = createMockRequest({
      headers: {
        'Authorization': 'Bearer valid-token'
      }
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('An internal server error occurred.');
    expect(data.details).toBe('Unexpected error');
  });
}); 