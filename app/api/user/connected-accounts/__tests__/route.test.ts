// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { describe, it, expect, beforeEach, vi } from 'vitest';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NextRequest } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GET, POST, DELETE } from '@app/api/user/connected-accounts/route';

// TODO: Add proper mocks and tests

beforeEach(() => {
  vi.clearAllMocks();
});

describe('/api/user/connected-accounts (alias for /api/connected-accounts)', () => {
  it('handles connected accounts endpoints', async () => {
    // TODO
  });
});
