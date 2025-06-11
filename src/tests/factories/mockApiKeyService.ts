import { vi } from "vitest";
export const createMockApiKeyService = () => ({
  listApiKeys: vi.fn().mockResolvedValue([]),
  createApiKey: vi.fn().mockResolvedValue({ 
    success: true, 
    key: { id: 'k1', name: 'test-key', scopes: [] }, 
    plaintext: 'secret-key' 
  }),
  revokeApiKey: vi.fn().mockResolvedValue({ success: true }),
  updateApiKey: vi.fn().mockResolvedValue({ success: true }),
});
