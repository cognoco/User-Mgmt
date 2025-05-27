// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { describe, it, expect, beforeEach, vi } from 'vitest';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NextRequest } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GET, POST, DELETE } from '../route';

// TODO: Add proper mocks and tests

beforeEach(() => {
  vi.clearAllMocks();
});

describe('/api/user/avatar (alias for /api/profile/avatar)', () => {
  it('handles avatar endpoints', async () => {
    // TODO
  });
});
