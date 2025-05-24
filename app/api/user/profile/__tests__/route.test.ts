// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { describe, it, expect, beforeEach, vi } from 'vitest';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NextRequest } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GET, PATCH } from '../route';

// TODO: Add proper mocks and tests

beforeEach(() => {
  vi.clearAllMocks();
});

describe('/api/user/profile GET', () => {
  it('returns user profile', async () => {
    // TODO
  });
});

describe('/api/user/profile PATCH', () => {
  it('updates user profile', async () => {
    // TODO
  });
});
