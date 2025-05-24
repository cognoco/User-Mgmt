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

describe('/api/user/settings GET', () => {
  it('returns user settings', async () => {
    // TODO
  });
});

describe('/api/user/settings PATCH', () => {
  it('updates user settings', async () => {
    // TODO
  });
});
