import { vi, type MockedFunction } from 'vitest';

// Define the service interface based on actual usage
export interface MockAuthService {
  getCurrentUser: MockedFunction<any>;
  deleteAccount: MockedFunction<any>;
  updatePassword: MockedFunction<any>;
  login: MockedFunction<any>;
  logout: MockedFunction<any>;
  refreshToken: MockedFunction<any>;
  sendVerificationEmail: MockedFunction<any>;
  verifyEmail: MockedFunction<any>;
  resetPassword: MockedFunction<any>;
  verifyResetToken: MockedFunction<any>;
}

// Factory function with sensible defaults
export function createMockAuthService(overrides: Partial<{
  getCurrentUser: any;
  deleteAccount: any;
  updatePassword: any;
  login: any;
  logout: any;
  refreshToken: any;
  sendVerificationEmail: any;
  verifyEmail: any;
  resetPassword: any;
  verifyResetToken: any;
}> = {}): MockAuthService {
  return {
    getCurrentUser: vi.fn().mockResolvedValue(overrides.getCurrentUser ?? { 
      id: 'user-1', 
      email: 'test@example.com',
      role: 'user'
    }),
    
    deleteAccount: vi.fn().mockResolvedValue(overrides.deleteAccount ?? { 
      success: true 
    }),
    
    updatePassword: vi.fn().mockResolvedValue(overrides.updatePassword ?? { 
      success: true 
    }),
    
    login: vi.fn().mockResolvedValue(overrides.login ?? { 
      user: { id: 'user-1', email: 'test@example.com' },
      token: 'mock-token',
      success: true
    }),
    
    logout: vi.fn().mockResolvedValue(overrides.logout ?? { 
      success: true 
    }),
    
    refreshToken: vi.fn().mockResolvedValue(overrides.refreshToken ?? { 
      token: 'new-mock-token',
      expiresAt: new Date(Date.now() + 3600000)
    }),
    
    sendVerificationEmail: vi.fn().mockResolvedValue(overrides.sendVerificationEmail ?? { 
      sent: true 
    }),
    
    verifyEmail: vi.fn().mockResolvedValue(overrides.verifyEmail ?? { 
      verified: true 
    }),
    
    resetPassword: vi.fn().mockResolvedValue(overrides.resetPassword ?? { 
      resetSent: true 
    }),
    
    verifyResetToken: vi.fn().mockResolvedValue(overrides.verifyResetToken ?? { 
      valid: true 
    })
  };
}

// Helper to setup auth service mock globally
export function setupAuthServiceMock(mockService?: MockAuthService) {
  const authService = mockService || createMockAuthService();
  
  // Mock the service getter
  vi.mock('@/lib/api/auth/getApiAuthService', () => ({
    getApiAuthService: vi.fn().mockReturnValue(authService)
  }));
  
  return authService;
} 