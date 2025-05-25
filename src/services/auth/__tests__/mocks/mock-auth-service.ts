// src/services/auth/__tests__/mocks/mock-auth-service.ts
import { AuthService } from '../../../../core/auth/auth-service';
// Import other necessary types

export class MockAuthService implements AuthService {
  // Implement all methods with test doubles
  login = vi.fn().mockResolvedValue({ success: true });
  register = vi.fn().mockResolvedValue({ success: true });
  logout = vi.fn().mockResolvedValue({ success: true });
  // Implement other methods...
}