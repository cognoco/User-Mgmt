// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { describe, it, expect, beforeEach, vi } from 'vitest';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NextRequest } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GET, PATCH } from '@/app/api/profile/business/route'297;

// TODO: Import global Supabase and rate-limit mocks as per project convention
// import { getServiceSupabase } from '@/lib/database/supabase';
// import { checkRateLimit } from '@/middleware/rateLimit'488;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const corporateUser = { id: 'corp-user', email: 'biz@example.com' };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const personalUser = { id: 'personal-user', email: 'user@example.com' };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const businessProfile = {
  userId: 'corp-user',
  userType: 'corporate',
  companyName: 'Acme Corp',
  companySize: '11-50',
  industry: 'Technology',
  companyWebsite: 'https://acme.com',
  position: 'Manager',
  department: 'Sales',
  vatId: 'VAT123',
  address: '123 Main St',
  bio: 'Business bio',
  location: 'HQ',
  website: 'https://acme.com',
  phoneNumber: '+1234567890',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('/api/profile/business GET', () => {
  it('returns business profile for corporate user', async () => {
    // TODO: Mock Supabase and authentication to return corporateUser and businessProfile
    // TODO: Mock rate limit to allow
    // TODO: Create NextRequest with valid auth header
    // TODO: Call GET and assert response
  });

  it('returns 404 if profile not found', async () => {
    // TODO
  });

  it('returns 403 if user is not corporate', async () => {
    // TODO
  });

  it('returns 401 if unauthenticated', async () => {
    // TODO
  });

  it('returns 401 if token is invalid', async () => {
    // TODO
  });

  it('returns 429 if rate limited', async () => {
    // TODO
  });
});

describe('/api/profile/business PATCH', () => {
  it('updates business profile for corporate user', async () => {
    // TODO: Mock Supabase and authentication to return corporateUser and businessProfile
    // TODO: Mock rate limit to allow
    // TODO: Create NextRequest with valid auth header and PATCH body
    // TODO: Call PATCH and assert response
  });

  it('returns 400 for validation errors', async () => {
    // TODO
  });

  it('returns 403 for permission errors (wrong user type)', async () => {
    // TODO
  });

  it('returns 400 if no fields provided', async () => {
    // TODO
  });

  it('returns 401 if unauthenticated', async () => {
    // TODO
  });

  it('returns 401 if token is invalid', async () => {
    // TODO
  });

  it('returns 429 if rate limited', async () => {
    // TODO
  });
}); 