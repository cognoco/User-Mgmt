// src/tests/utils/test-service-setup.ts
import { UserManagementConfiguration } from '../../core/configuration';
import { MockAuthService } from '../../services/auth/__tests__/mocks/mock-auth-service';
import { MockUserService } from '../../services/user/__tests__/mocks/mock-user-service';
import { MockTeamService } from '../../services/team/__tests__/mocks/mock-team-service';
import { MockPermissionService } from '../../services/permission/__tests__/mocks/mock-permission-service';
// Import other mock services as needed

/**
 * Sets up mock services for UI component testing
 * @param customConfig Optional custom configuration overrides
 */
export function setupTestServices(customConfig = {}) {
  // Reset the configuration
  UserManagementConfiguration.reset();
  
  // Create mock services
  const mockAuthService = new MockAuthService();
  const mockUserService = new MockUserService();
  const mockTeamService = new MockTeamService();
  const mockPermissionService = new MockPermissionService();
  // Create other mock services as needed
  
  // Configure with mock services
  UserManagementConfiguration.configure({
    authService: mockAuthService,
    userService: mockUserService,
    teamService: mockTeamService,
    permissionService: mockPermissionService,
    // Add other services
    ...customConfig
  });
  
  // Return the mock services for test-specific customization
  return {
    mockAuthService,
    mockUserService,
    mockTeamService,
    mockPermissionService,
    // Return other mock services
  };
}