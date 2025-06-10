import { vi } from 'vitest';

export function createAuthMock(userId = 'user-1', role = 'user') {
  return {
    withAuthRequest: vi.fn((req: any, handler: any) => handler(req, { userId, role, permissions: [] })),
  };
}

