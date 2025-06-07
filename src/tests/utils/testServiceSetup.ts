// src/tests/utils/test-service-setup.ts
import { vi } from 'vitest';
import { UserManagementConfiguration } from '@/src/core/config'72;
import { MockAuthService } from '@/src/services/auth/__tests__/mocks/mockAuthService'138;
import { MockUserService } from '@/src/services/user/__tests__/mocks/mockUserService'228;
import { MockTeamService } from '@/src/services/team/__tests__/mocks/mockTeamService'318;
import { MockPermissionService } from '@/src/services/permission/__tests__/mocks/mockPermissionService'408;

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
  
  // Configure with mock services
  UserManagementConfiguration.configureServiceProviders({
    authService: mockAuthService,
    userService: mockUserService,
    teamService: mockTeamService,
    permissionService: mockPermissionService,
    ...customConfig
  });
  
  // Setup default mock data
  setupDefaultMockData(mockAuthService, mockUserService, mockTeamService, mockPermissionService);
  
  // Return the mock services for test-specific customization
  return {
    mockAuthService,
    mockUserService,
    mockTeamService,
    mockPermissionService
  };
}

/**
 * Sets up default mock data for testing
 */
function setupDefaultMockData(
  authService: MockAuthService,
  userService: MockUserService,
  teamService: MockTeamService,
  permissionService: MockPermissionService
) {
  // Setup a default authenticated user
  const defaultUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    emailVerified: true
  };
  
  authService.setMockUser(defaultUser);
  
  // Setup default user profile
  userService.setMockProfile('user-123', {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    fullName: 'Test User',
    isActive: true,
    isVerified: true,
    userType: 'private'
  });
  
  // Setup default team
  const defaultTeam = {
    id: 'team-123',
    name: 'Test Team',
    description: 'A team for testing',
    ownerId: 'user-123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: false
  };
  
  teamService.setMockTeam(defaultTeam);
  
  // Setup default roles and permissions
  const adminRole = {
    id: 'role-admin',
    name: 'admin',
    description: 'Administrator role',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    permissions: [
      { name: 'user:read', description: 'Read user data' },
      { name: 'user:write', description: 'Write user data' },
      { name: 'team:read', description: 'Read team data' },
      { name: 'team:write', description: 'Write team data' }
    ]
  };
  
  permissionService.setMockRole(adminRole);
  
  // Assign admin role to default user
  permissionService.setMockUserRoles('user-123', [{
    id: 'user-role-123',
    userId: 'user-123',
    roleId: 'role-admin',
    assignedBy: 'system',
    assignedAt: new Date().toISOString()
  }]);
}