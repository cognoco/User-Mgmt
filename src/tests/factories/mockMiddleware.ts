export const createMockMiddleware = () => ({
  withSecurity: vi.fn((handler) => handler),
  withAuthRateLimit: vi.fn((_req, handler) => handler),
  routeAuthMiddleware: vi.fn(() => (handler) => (req, _ctx, data) =>
    handler(req, { userId: 'u1' }, data)
  ),
  checkRateLimit: vi.fn().mockResolvedValue(false),
});
