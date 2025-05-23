# User Management Module Import Path Migration Guide

This document provides a comprehensive guide for using the correct import paths in the refactored User Management Module architecture. Following these conventions ensures proper separation of concerns and adherence to the layered architecture principles.

## Layered Architecture Import Paths

The User Management Module follows a strict layered architecture with specific import patterns for each layer:

### Core Layer

Imports for domain interfaces, entities, and business rules:

```typescript
import { SomeInterface } from '@/core/{domain}/{file}';
```

Examples:
```typescript
import { User } from '@/core/user/types';
import { AuthCredentials } from '@/core/auth/types';
import { Team } from '@/core/team/types';
import { Permission } from '@/core/permission/types';
```

### Adapter Layer

Imports for implementations of interfaces for external services:

```typescript
import { SomeAdapter } from '@/adapters/{domain}/{file}';
```

Examples:
```typescript
import { SupabaseAuthProvider } from '@/adapters/auth/supabase-auth-provider';
import { SupabaseUserProvider } from '@/adapters/user/supabase-user-provider';
import { SupabaseTeamProvider } from '@/adapters/team/supabase-team-provider';
import { SupabasePermissionProvider } from '@/adapters/permission/supabase-permission-provider';
```

### Service Layer

Imports for implementations of core business logic:

```typescript
import { SomeService } from '@/services/{domain}/{file}';
```

Examples:
```typescript
import { AuthService } from '@/services/auth/auth-service';
import { DefaultAuthService } from '@/services/auth/default-auth-service';
import { UserService } from '@/services/user/user-service';
import { DefaultUserService } from '@/services/user/default-user-service';
import { TeamService } from '@/services/team/team-service';
import { DefaultTeamService } from '@/services/team/default-team-service';
```

### Hook Layer

Imports for React hooks connecting UI to services:

```typescript
import { useSomeHook } from '@/hooks/{domain}/{file}';
```

Examples:
```typescript
import { useAuth } from '@/hooks/auth/useAuthLegacy';
import { useRegistration } from '@/hooks/auth/use-registration';
import { useUserProfile } from '@/hooks/user/use-user-profile';
import { useAccountSettings } from '@/hooks/user/use-account-settings';
import { useTeams } from '@/hooks/team/use-teams';
import { useTeamMembers } from '@/hooks/team/use-team-members';
```

### UI Layer

Imports for UI components are divided into headless (behavior) and styled (appearance) components:

#### Headless Components

```typescript
import { SomeHeadlessComponent } from '@/ui/headless/{domain}/{file}';
```

Examples:
```typescript
import { HeadlessLoginForm } from '@/ui/headless/auth/login-form';
import { HeadlessRegistrationForm } from '@/ui/headless/auth/registration-form';
import { HeadlessProfileForm } from '@/ui/headless/user/profile-form';
import { HeadlessTeamList } from '@/ui/headless/team/team-list';
```

#### Styled Components

```typescript
import { SomeStyledComponent } from '@/ui/styled/{domain}/{file}';
```

Examples:
```typescript
import { LoginForm } from '@/ui/styled/auth/login-form';
import { RegistrationForm } from '@/ui/styled/auth/registration-form';
import { ProfileForm } from '@/ui/styled/user/profile-form';
import { AccountSettings } from '@/ui/styled/user/account-settings';
import { TeamList } from '@/ui/styled/team/team-list';
import { MemberManager } from '@/ui/styled/team/member-manager';
```

## Common Import Path Examples by Domain

### Auth Domain

#### Auth Components
```typescript
// Styled components
import { LoginForm } from '@/ui/styled/auth/login-form';
import { RegistrationForm } from '@/ui/styled/auth/registration-form';
import { ResetPasswordForm } from '@/ui/styled/auth/reset-password-form';
import { MagicLinkForm } from '@/ui/styled/auth/magic-link-form';
import { MfaSetupForm } from '@/ui/styled/auth/mfa-setup-form';
import { OAuthButtons } from '@/ui/styled/auth/oauth-buttons';

// Headless components
import { HeadlessLoginForm } from '@/ui/headless/auth/login-form';
import { HeadlessRegistrationForm } from '@/ui/headless/auth/registration-form';
import { HeadlessResetPasswordForm } from '@/ui/headless/auth/reset-password-form';
import { HeadlessMagicLinkForm } from '@/ui/headless/auth/magic-link-form';
import { HeadlessMfaSetupForm } from '@/ui/headless/auth/mfa-setup-form';
import { HeadlessOAuthButtons } from '@/ui/headless/auth/oauth-buttons';
```

#### Auth Hooks
```typescript
import { useAuth } from '@/hooks/auth/useAuthLegacy';
import { useRegistration } from '@/hooks/auth/use-registration';
import { usePasswordReset } from '@/hooks/auth/use-password-reset';
import { useMagicLink } from '@/hooks/auth/use-magic-link';
import { useMfa } from '@/hooks/auth/use-mfa';
import { useOAuth } from '@/hooks/auth/use-oauth';
```

#### Auth Services
```typescript
import { AuthService } from '@/services/auth/auth-service';
import { DefaultAuthService } from '@/services/auth/default-auth-service';
import { MfaService } from '@/services/auth/mfa-service';
import { DefaultMfaService } from '@/services/auth/default-mfa-service';
import { OAuthService } from '@/services/auth/oauth-service';
import { DefaultOAuthService } from '@/services/auth/default-oauth-service';
```

#### Auth Adapters
```typescript
import { AuthDataProvider } from '@/adapters/auth/auth-data-provider';
import { SupabaseAuthProvider } from '@/adapters/auth/supabase-auth-provider';
import { MfaDataProvider } from '@/adapters/auth/mfa-data-provider';
import { SupabaseMfaProvider } from '@/adapters/auth/supabase-mfa-provider';
```

### User Domain

#### User Components
```typescript
// Styled components
import { ProfileForm } from '@/ui/styled/user/profile-form';
import { AccountSettings } from '@/ui/styled/user/account-settings';
import { UserAvatar } from '@/ui/styled/user/user-avatar';
import { UserCard } from '@/ui/styled/user/user-card';
import { UserList } from '@/ui/styled/user/user-list';

// Headless components
import { HeadlessProfileForm } from '@/ui/headless/user/profile-form';
import { HeadlessAccountSettings } from '@/ui/headless/user/account-settings';
import { HeadlessUserAvatar } from '@/ui/headless/user/user-avatar';
import { HeadlessUserCard } from '@/ui/headless/user/user-card';
import { HeadlessUserList } from '@/ui/headless/user/user-list';
```

#### User Hooks
```typescript
import { useUserProfile } from '@/hooks/user/use-user-profile';
import { useAccountSettings } from '@/hooks/user/use-account-settings';
import { useUserAvatar } from '@/hooks/user/use-user-avatar';
import { useUsers } from '@/hooks/user/use-users';
```

#### User Services
```typescript
import { UserService } from '@/services/user/user-service';
import { DefaultUserService } from '@/services/user/default-user-service';
import { UserProfileService } from '@/services/user/user-profile-service';
import { DefaultUserProfileService } from '@/services/user/default-user-profile-service';
```

#### User Adapters
```typescript
import { UserDataProvider } from '@/adapters/user/user-data-provider';
import { SupabaseUserProvider } from '@/adapters/user/supabase-user-provider';
import { UserProfileDataProvider } from '@/adapters/user/user-profile-data-provider';
import { SupabaseUserProfileProvider } from '@/adapters/user/supabase-user-profile-provider';
```

### Team Domain

#### Team Components
```typescript
// Styled components
import { TeamList } from '@/ui/styled/team/team-list';
import { TeamForm } from '@/ui/styled/team/team-form';
import { MemberManager } from '@/ui/styled/team/member-manager';
import { TeamCard } from '@/ui/styled/team/team-card';
import { InvitationForm } from '@/ui/styled/team/invitation-form';

// Headless components
import { HeadlessTeamList } from '@/ui/headless/team/team-list';
import { HeadlessTeamForm } from '@/ui/headless/team/team-form';
import { HeadlessMemberManager } from '@/ui/headless/team/member-manager';
import { HeadlessTeamCard } from '@/ui/headless/team/team-card';
import { HeadlessInvitationForm } from '@/ui/headless/team/invitation-form';
```

#### Team Hooks
```typescript
import { useTeams } from '@/hooks/team/use-teams';
import { useTeamMembers } from '@/hooks/team/use-team-members';
import { useTeamInvitations } from '@/hooks/team/use-team-invitations';
import { useTeamRoles } from '@/hooks/team/use-team-roles';
```

#### Team Services
```typescript
import { TeamService } from '@/services/team/team-service';
import { DefaultTeamService } from '@/services/team/default-team-service';
import { TeamMemberService } from '@/services/team/team-member-service';
import { DefaultTeamMemberService } from '@/services/team/default-team-member-service';
import { InvitationService } from '@/services/team/invitation-service';
import { DefaultInvitationService } from '@/services/team/default-invitation-service';
```

#### Team Adapters
```typescript
import { TeamDataProvider } from '@/adapters/team/team-data-provider';
import { SupabaseTeamProvider } from '@/adapters/team/supabase-team-provider';
import { TeamMemberDataProvider } from '@/adapters/team/team-member-data-provider';
import { SupabaseTeamMemberProvider } from '@/adapters/team/supabase-team-member-provider';
import { InvitationDataProvider } from '@/adapters/team/invitation-data-provider';
import { SupabaseInvitationProvider } from '@/adapters/team/supabase-invitation-provider';
```

### Permission Domain

#### Permission Components
```typescript
// Styled components
import { RoleManager } from '@/ui/styled/permission/role-manager';
import { PermissionMatrix } from '@/ui/styled/permission/permission-matrix';
import { RoleSelector } from '@/ui/styled/permission/role-selector';

// Headless components
import { HeadlessRoleManager } from '@/ui/headless/permission/role-manager';
import { HeadlessPermissionMatrix } from '@/ui/headless/permission/permission-matrix';
import { HeadlessRoleSelector } from '@/ui/headless/permission/role-selector';
```

#### Permission Hooks
```typescript
import { useRoles } from '@/hooks/permission/use-roles';
import { usePermissions } from '@/hooks/permission/use-permissions';
import { useUserPermissions } from '@/hooks/permission/use-user-permissions';
```

#### Permission Services
```typescript
import { PermissionService } from '@/services/permission/permission-service';
import { DefaultPermissionService } from '@/services/permission/default-permission-service';
import { RoleService } from '@/services/permission/role-service';
import { DefaultRoleService } from '@/services/permission/default-role-service';
```

#### Permission Adapters
```typescript
import { PermissionDataProvider } from '@/adapters/permission/permission-data-provider';
import { SupabasePermissionProvider } from '@/adapters/permission/supabase-permission-provider';
import { RoleDataProvider } from '@/adapters/permission/role-data-provider';
import { SupabaseRoleProvider } from '@/adapters/permission/supabase-role-provider';
```

## Common Incorrect Paths and Their Replacements

Below is a list of common incorrect import paths from the old architecture and their correct replacements in the new architecture:

| Incorrect Path | Correct Path |
|---------------|-------------|
| `@/components/auth/LoginForm` | `@/ui/styled/auth/login-form` |
| `@/components/auth/RegistrationForm` | `@/ui/styled/auth/registration-form` |
| `@/components/profile/ProfileForm` | `@/ui/styled/user/profile-form` |
| `@/components/team/TeamList` | `@/ui/styled/team/team-list` |
| `@/lib/auth/useAuth` | `@/hooks/auth/useAuthLegacy` |
| `@/lib/user/useProfile` | `@/hooks/user/use-user-profile` |
| `@/lib/team/useTeams` | `@/hooks/team/use-teams` |
| `@/lib/stores/authStore` | `@/services/auth/auth-store` |
| `@/lib/stores/userStore` | `@/services/user/user-store` |
| `@/lib/stores/teamStore` | `@/services/team/team-store` |
| `@/lib/database/supabase` | `@/adapters/auth/supabase-auth-provider` or other specific adapter |
| `@/utils/auth` | `@/services/auth/auth-utils` |
| `@/types/auth` | `@/core/auth/types` |
| `@/types/user` | `@/core/user/types` |
| `@/types/team` | `@/core/team/types` |

## Search Patterns for Finding Incorrect Imports

Use these search patterns in your IDE or with grep to find and replace incorrect imports:

```
import .* from ['"]@/components/.*['"]  # Find old component imports
import .* from ['"]@/lib/.*['"]       # Find old lib imports
import .* from ['"]@/utils/.*['"]     # Find old utils imports
import .* from ['"]@/types/.*['"]     # Find old types imports
import .* from ['"]@/hooks/.*['"]     # Find old hooks imports (not in the new structure)
```

## Special Cases and Exceptions

### Test Files

Test files should follow the same import structure but be located in `__tests__` directories adjacent to the files they test:

```typescript
// Test for a service
import { DefaultAuthService } from '@/services/auth/default-auth-service';
// Test file would be at: @/services/auth/__tests__/default-auth-service.test.ts

// Test for a UI component
import { LoginForm } from '@/ui/styled/auth/login-form';
// Test file would be at: @/ui/styled/auth/__tests__/login-form.test.ts
```

### Mocks

Mock files should be placed in `__tests__/mocks` directories adjacent to the files they mock:

```typescript
// Mock for an adapter
// Original: import { SupabaseAuthProvider } from '@/adapters/auth/supabase-auth-provider';
// Mock would be at: @/adapters/auth/__tests__/mocks/supabase-auth-provider.mock.ts

// Mock for a service
// Original: import { DefaultAuthService } from '@/services/auth/default-auth-service';
// Mock would be at: @/services/auth/__tests__/mocks/default-auth-service.mock.ts
```

### Utility Functions

Utility functions should be placed in the appropriate domain directory:

```typescript
// Auth-related utilities
import { formatAuthError } from '@/services/auth/auth-utils';

// User-related utilities
import { formatUserName } from '@/services/user/user-utils';

// General utilities (not domain-specific)
import { formatDate } from '@/utils/date-utils';
```

### Configuration

Configuration-related imports:

```typescript
import { UserManagementConfig } from '@/core/config/user-management-config';
import { configureUserManagement } from '@/core/config/configure';
```

## Migration Strategy

When migrating from the old architecture to the new one, follow these steps:

1. Identify the domain of the file you're working with (auth, user, team, permission)
2. Determine which layer it belongs to (core, adapter, service, hook, UI)
3. Move the file to its new location following the patterns above
4. Update all imports in the file to use the new paths
5. Update all files that import this file to use the new path

Use the search patterns provided above to systematically find and replace all incorrect imports.

## Conclusion

Following these import path conventions ensures that the User Management Module maintains proper separation of concerns and adheres to the layered architecture principles. This makes the codebase more maintainable, testable, and allows for easier customization by host applications.