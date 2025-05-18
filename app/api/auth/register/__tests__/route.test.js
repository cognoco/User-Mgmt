import { createMocks } from 'node-mocks-http';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase client
const mockSignUp = vi.fn();
vi.mock('../../../../lib/supabase.js', () => ({
  supabase: {
    auth: {
      signUp: mockSignUp,
    },
  },
}));

// Mock the middleware - assuming it just passes the handler through for now
vi.mock('../../../../middleware', () => ({
  withSecurity: vi.fn((handler) => handler),
}));

// Import the handler AFTER mocks are defined
import handler from '../../../../pages/api/auth/register.js';

describe('/api/auth/register', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('should return 405 if method is not POST', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getHeaders().allow).toBe('POST');
    expect(res._getJSONData().error).toBe('Method GET Not Allowed');
  });

  it('should return 400 for invalid email', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'not-an-email',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const jsonResponse = res._getJSONData();
    expect(jsonResponse.error).toBe('Validation failed');
    expect(jsonResponse.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email', message: 'Invalid email address' }),
      ])
    );
  });

  it('should return 400 for password too short', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'short',
        firstName: 'Test',
        lastName: 'User',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const jsonResponse = res._getJSONData();
    expect(jsonResponse.error).toBe('Validation failed');
    expect(jsonResponse.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'password', message: 'Password must be at least 8 characters long' }),
      ])
    );
  });

  it('should return 400 for missing first name', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
        // firstName: 'Test', // Missing
        lastName: 'User',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const jsonResponse = res._getJSONData();
    expect(jsonResponse.error).toBe('Validation failed');
    expect(jsonResponse.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'firstName' }), // Zod might add a default message or specific one
      ])
    );
  });

    it('should return 400 for missing last name', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        // lastName: 'User', // Missing
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const jsonResponse = res._getJSONData();
    expect(jsonResponse.error).toBe('Validation failed');
    expect(jsonResponse.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'lastName' }), // Zod might add a default message or specific one
      ])
    );
  });

  it('should return 200 and success message on successful registration', async () => {
    const mockUserData = { id: 'user-123', email: 'test@example.com' };
    mockSignUp.mockResolvedValueOnce({ data: { user: mockUserData }, error: null });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const jsonResponse = res._getJSONData();
    expect(jsonResponse.message).toBe('Registration successful. Please check your email to verify your account.');
    expect(jsonResponse.user).toEqual(mockUserData);
    expect(mockSignUp).toHaveBeenCalledTimes(1);
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
        },
        emailRedirectTo: expect.any(String), // Check that it's included
      },
    });
  });

  it('should return 409 if email already exists', async () => {
    mockSignUp.mockResolvedValueOnce({ data: null, error: { message: 'User already registered' } });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(409);
    expect(res._getJSONData().error).toBe('Email already exists');
    expect(mockSignUp).toHaveBeenCalledTimes(1);
  });

  it('should return 400 for other Supabase errors', async () => {
    const errorMessage = 'A generic Supabase error occurred';
    mockSignUp.mockResolvedValueOnce({ data: null, error: { message: errorMessage } });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().error).toBe(errorMessage);
    expect(mockSignUp).toHaveBeenCalledTimes(1);
  });

  it('should return 500 for unexpected internal errors', async () => {
    const errorMessage = 'Unexpected error';
    mockSignUp.mockRejectedValueOnce(new Error(errorMessage)); // Simulate unexpected throw

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData().error).toBe('Internal server error during registration');
    expect(mockSignUp).toHaveBeenCalledTimes(1);
  });
});

describe('/api/auth/register - Business Registration', () => {
  it('should return 200 and success message on successful business registration', async () => {
    const mockUserData = { id: 'user-456', email: 'biz@example.com' };
    mockSignUp.mockResolvedValueOnce({ data: { user: mockUserData }, error: null });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        userType: 'corporate',
        email: 'biz@example.com',
        password: 'Password123!',
        companyName: 'Acme Corp',
        companyWebsite: 'https://acme.com',
        department: 'Sales',
        industry: 'Technology',
        companySize: '11-50',
        position: 'Manager',
        acceptTerms: true,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const jsonResponse = res._getJSONData();
    expect(jsonResponse.message).toBe('Registration successful. Please check your email to verify your account.');
    expect(jsonResponse.user).toEqual(mockUserData);
    expect(mockSignUp).toHaveBeenCalledTimes(1);
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'biz@example.com',
      password: 'Password123!',
      options: expect.objectContaining({
        data: expect.objectContaining({
          user_type: 'corporate',
          company_name: 'Acme Corp',
          company_website: 'https://acme.com',
          department: 'Sales',
          industry: 'Technology',
          company_size: '11-50',
          position: 'Manager',
        }),
        emailRedirectTo: expect.any(String),
      }),
    });
  });

  it('should return 400 if companyName is missing for business registration', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        userType: 'corporate',
        email: 'biz@example.com',
        password: 'Password123!',
        // companyName missing
        companyWebsite: 'https://acme.com',
        acceptTerms: true,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const jsonResponse = res._getJSONData();
    expect(jsonResponse.error).toBe('Validation failed');
    expect(jsonResponse.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'companyName', message: 'Company name is required' }),
      ])
    );
  });

  it('should return 400 for invalid company website URL', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        userType: 'corporate',
        email: 'biz@example.com',
        password: 'Password123!',
        companyName: 'Acme Corp',
        companyWebsite: 'not-a-url',
        acceptTerms: true,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const jsonResponse = res._getJSONData();
    expect(jsonResponse.error).toBe('Validation failed');
    expect(jsonResponse.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'companyWebsite', message: 'Please enter a valid website URL' }),
      ])
    );
  });

  it('should return 400 if userType is missing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'biz@example.com',
        password: 'Password123!',
        companyName: 'Acme Corp',
        acceptTerms: true,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const jsonResponse = res._getJSONData();
    expect(jsonResponse.error).toBe('Validation failed');
  });

  it('should return 400 if userType is invalid', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        userType: 'unknown',
        email: 'biz@example.com',
        password: 'Password123!',
        companyName: 'Acme Corp',
        acceptTerms: true,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    const jsonResponse = res._getJSONData();
    expect(jsonResponse.error).toBe('Validation failed');
  });

  it('should still allow personal registration', async () => {
    const mockUserData = { id: 'user-789', email: 'personal@example.com' };
    mockSignUp.mockResolvedValueOnce({ data: { user: mockUserData }, error: null });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        userType: 'private',
        email: 'personal@example.com',
        password: 'Password123!',
        firstName: 'Jane',
        lastName: 'Doe',
        acceptTerms: true,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const jsonResponse = res._getJSONData();
    expect(jsonResponse.message).toBe('Registration successful. Please check your email to verify your account.');
    expect(jsonResponse.user).toEqual(mockUserData);
    expect(mockSignUp).toHaveBeenCalledTimes(1);
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'personal@example.com',
      password: 'Password123!',
      options: expect.objectContaining({
        data: expect.objectContaining({
          user_type: 'private',
          first_name: 'Jane',
          last_name: 'Doe',
        }),
        emailRedirectTo: expect.any(String),
      }),
    });
  });
}); 
