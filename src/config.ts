/**
 * Application Configuration
 * 
 * This file configures the User Management Module with the necessary service providers
 * and feature flags to make the application work.
 */

import { UserManagementConfiguration } from '@/core/config';
import { DefaultAuthService } from '@/services/auth/default-auth-service';
import { SupabaseAuthAdapter } from '@/adapters/auth/supabase-auth-adapter';
import { DefaultUserService } from '@/services/user/default-user-service';
import { SupabaseUserAdapter } from '@/adapters/user/supabase-user-adapter';
import { DefaultTeamService } from '@/services/team/default-team-service';
import { SupabaseTeamAdapter } from '@/adapters/team/supabase-team-adapter';
import { DefaultPermissionService } from '@/services/permission/default-permission-service';
import { SupabasePermissionAdapter } from '@/adapters/permission/supabase-permission-adapter';

// Create adapter instances
const authAdapter = new SupabaseAuthAdapter();
const userAdapter = new SupabaseUserAdapter();
const teamAdapter = new SupabaseTeamAdapter();
const permissionAdapter = new SupabasePermissionAdapter();

// Create service instances
const authService = new DefaultAuthService(authAdapter);
const userService = new DefaultUserService(userAdapter);
const teamService = new DefaultTeamService(teamAdapter);
const permissionService = new DefaultPermissionService(permissionAdapter);

// Configure the User Management Module
UserManagementConfiguration.configure({
  serviceProviders: {
    // Register all required services
    authService,
    userService,
    teamService,
    permissionService,
  },
  options: {
    // Configure redirect paths
    redirects: {
      afterLogin: '/dashboard',
      afterLogout: '/',
      afterRegistration: '/dashboard',
      afterPasswordReset: '/login',
    },
  },
});

export default UserManagementConfiguration;
