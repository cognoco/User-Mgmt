# User Management Module Refactoring Checklist

This document outlines the step-by-step tasks required to refactor the User Management Module according to the new architecture principles, making it more modular, pluggable, and customizable for host applications.

## Phase 1: Core Architecture Setup

- [x] Create new directory structure
  - [x] Create `/src/core` directory for business logic & interfaces
  - [x] Create `/src/adapters` directory for external dependencies
  - [x] Create `/src/ui/headless` directory for behavior-only components
  - [x] Create `/src/ui/styled` directory for default styled implementations

- [x] Create configuration system
  - [x] Create configuration interfaces in `/src/core/config/interfaces.ts`
  - [x] Implement feature flag system with toggles for all major features
  - [x] Implement service provider registry for dependency injection
  - [x] Create configuration API in `/src/core/config/index.ts` with methods for customization

## Phase 2: Define Core Interfaces

- [x] Authentication domain
  - [x] Define `AuthService` interface
  - [x] Define authentication entities (User, Session, etc.)
  - [x] Define authentication events

- [x] User management domain
  - [x] Define `UserService` interface
  - [x] Define user profile entities
  - [x] Define user management events

- [x] Team management domain
  - [x] Define `TeamService` interface
  - [x] Define team entities
  - [x] Define team management events

- [x] Notification domain
  - [x] Review existing `NotificationHandler` interface
  - [x] Define notification entities
  - [x] Define notification events

- [x] Permission & Role domain
  - [x] Define `PermissionService` interface
  - [x] Define role and permission entities
  - [x] Define permission events

## Phase 3: Implement Default Implementations

- [x] Authentication implementation
  - [x] Implement `DefaultAuthService`
  - [x] Implement auth entity models
  - [x] Create auth service factory function

- [x] User management implementation
  - [x] Implement `DefaultUserService`
  - [x] Implement user profile models
  - [x] Create user service factory function

- [x] Team management implementation
  - [x] Implement `DefaultTeamService`
  - [x] Implement team models
  - [x] Create team service factory function

- [x] Notification implementation
  - [x] Update `DefaultNotificationHandler` if needed
  - [x] Implement notification models
  - [x] Create notification handler factory function

- [x] Permission & Role implementation
  - [x] Implement `DefaultPermissionService`
  - [x] Implement role and permission models
  - [x] Create permission service factory function

## Phase 4: Database Adapter Layer

- [x] Create database adapter interfaces
  - [x] Define `AuthDataProvider` interface
  - [x] Define `UserDataProvider` interface
  - [x] Define `TeamDataProvider` interface
  - [x] Define `PermissionDataProvider` interface

- [x] Implement Supabase adapters
  - [x] Implement `SupabaseAuthProvider`
  - [x] Implement `SupabaseUserProvider`
  - [x] Implement `SupabaseTeamProvider`
  - [x] Implement `SupabasePermissionProvider`

- [x] Create adapter factory functions
  - [x] Create auth adapter factory
  - [x] Create user adapter factory
  - [x] Create team adapter factory
  - [x] Create permission adapter factory

## Phase 5: React Hooks Layer

- [x] Authentication hooks
  - [x] Implement `useAuth` hook
  - [x] Implement `useRegistration` hook
  - [x] Implement `usePasswordReset` hook
  - [x] Implement `useMFA` hook

- [x] User management hooks
  - [x] Implement `useUserProfile` hook
  - [x] Implement `useAccountSettings` hook

- [x] Team management hooks
  - [x] Implement `useTeams` hook
  - [x] Implement `useTeamMembers` hook
  - [x] Implement `useTeamInvitations` hook

- [x] Permission hooks
  - [x] Implement `useRoles` hook
  - [x] Implement `usePermissions` hook

## Phase 6: Headless UI Components

- [x] Authentication components
  - [x] Create headless `LoginForm` component
  - [x] Create headless `RegistrationForm` component
  - [x] Create headless `PasswordResetForm` component
  - [x] Create headless `MFASetup` component

- [x] User profile components
  - [x] Create headless `ProfileEditor` component
  - [x] Create headless `AccountSettings` component

- [x] Team management components
  - [x] Create headless `TeamCreator` component
  - [x] Create headless `TeamMemberManager` component
  - [x] Create headless `InvitationManager` component

- [x] Permission components
  - [x] Create headless `RoleManager` component
  - [x] Create headless `PermissionEditor` component

## Phase 7: Default Styled Components

- [x] Authentication UI components
  - [x] Create styled `LoginForm` component
  - [x] Create styled `RegistrationForm` component
  - [x] Create styled `PasswordResetForm` component
  - [x] Create styled `MFASetup` component

- [x] User profile UI components
  - [x] Create styled `ProfileEditor` component
  - [x] Create styled `AccountSettings` component

- [x] Team management UI components
  - [x] Create styled `TeamCreator` component
  - [x] Create styled `TeamMemberManager` component
  - [x] Create styled `InvitationManager` component

- [x] Permission UI components
  - [x] Create styled `RoleManager` component
  - [x] Create styled `PermissionEditor` component

## Phase 8: Page Integration

- [x] Authentication pages
  - [x] Update login page with new components
  - [x] Update registration page with new components
  - [x] Update password reset page with new components
  - [x] Update MFA setup page with new components

- [x] User profile pages
  - [x] Update profile page with new components
  - [x] Update settings page with new components

- [x] Team management pages
  - [x] Update team dashboard with new components
  - [x] Update team management page with new components
  - [x] Update invitation page with new components

- [x] Permission pages
  - [x] Update role management page with new components
  - [x] Update permission editor page with new components

## Phase 9: API Integration

- [x] Authentication API
  - [x] Update login endpoint to use new architecture
  - [x] Update registration endpoint to use new architecture
  - [x] Update password reset endpoint to use new architecture
  - [x] Update logout endpoint to use new architecture
  - [x] Update send-verification-email endpoint to use new architecture
  - [x] Update MFA verification endpoints to use new architecture
  - [x] Update account endpoints to use new architecture
  - [x] Update CSRF token endpoint to use new architecture

- [x] User profile API
  - [x] Update profile endpoints to use new architecture
  - [x] Update settings endpoints to use new architecture

- [x] Team management API
  - [x] Update team endpoints to use new architecture
  - [x] Update member endpoints to use new architecture
  - [x] Update invitation endpoints to use new architecture

- [x] Permission API
  - [x] Update role endpoints to use new architecture
  - [x] Update permission endpoints to use new architecture

## Phase 10: Testing

- [ ] For all tests! 
  - [ ] Find existing tests for each component
    - [ ] If test exists evaluate if the test can be simply amended
      - [ ]If test  can be simply amended, keep test and amend. Else use the same file but delete the current content and recreate

- [ ] **Unit Tests**
  - [ ] Test all core service methods (happy path, edge cases, error handling, input validation)
  - [ ] Test all adapter methods (mocking database interactions)
  - [ ] Test utility functions
  - [ ] Test model/entity logic

- [ ] **Component Tests**
  - [ ] Test headless components (state management, event handling, prop handling)
  - [ ] Test styled components (rendering, prop-based styling, interaction visuals, responsiveness)

- [ ] **Integration Tests**
  - [ ] Test component-hook integration
  - [ ] Test hook-service integration
  - [ ] Test service-adapter integration
  - [ ] Test API endpoints
  - [ ] Test cross-domain interactions

- [ ] **End-to-End Tests**
  - [ ] Test core user journeys (registration, login, profile update, team management, etc.)
  - [ ] Test permissions and roles
  - [ ] Test edge case flows
  - [ ] Test integration with host application (if applicable)

- [ ] **Test Maintenance**
  - [ ] Find existing tests for each component/feature
  - [ ] Evaluate if existing tests can be amended or need to be rewritten
  - [ ] Ensure all new code is covered by tests

## Phase 11: Documentation

- [ ] Architecture overview
  - [ ] Document high-level architecture
  - [ ] Create component diagrams

- [ ] Integration guide
  - [ ] Document integration steps for host applications
  - [ ] Provide configuration examples

- [ ] Customization guide
  - [ ] Document UI customization options
  - [ ] Document service replacement options

- [ ] API reference
  - [ ] Document core interfaces
  - [ ] Document available hooks
  - [ ] Document component props

- [ ] Import path reference
  - [ ] Document all import path changes
    - [ ] Core layer imports: `@/core/{domain}/{file}`
    - [ ] Adapter layer imports: `@/adapters/{domain}/{file}`
    - [ ] Service layer imports: `@/services/{domain}/{file}`
    - [ ] Hook layer imports: `@/hooks/{domain}/{file}`
    - [ ] UI layer imports: `@/ui/headless/{domain}/{file}` and `@/ui/styled/{domain}/{file}`
  - [ ] Common import path examples:
    - [ ] Auth components: `@/ui/styled/auth/LoginForm`, `@/ui/styled/auth/RegistrationForm`, etc.
    - [ ] User components: `@/ui/styled/user/ProfileForm`, `@/ui/styled/user/AccountSettings`, etc.
    - [ ] Team components: `@/ui/styled/team/TeamList`, `@/ui/styled/team/MemberManager`, etc.
    - [ ] Auth hooks: `@/hooks/auth/useAuth`, `@/hooks/auth/useRegistration`, etc.
    - [ ] User hooks: `@/hooks/user/useUserProfile`, `@/hooks/user/useAccountSettings`, etc.
    - [ ] Team hooks: `@/hooks/team/useTeams`, `@/hooks/team/useTeamMembers`, etc.
    - [ ] Auth services: `@/services/auth/AuthService`, `@/services/auth/DefaultAuthService`, etc.
    - [ ] User services: `@/services/user/UserService`, `@/services/user/DefaultUserService`, etc.
    - [ ] Team services: `@/services/team/TeamService`, `@/services/team/DefaultTeamService`, etc.
    - [ ] Auth adapters: `@/adapters/auth/AuthDataProvider`, `@/adapters/auth/SupabaseAuthProvider`, etc.
    - [ ] User adapters: `@/adapters/user/UserDataProvider`, `@/adapters/user/SupabaseUserProvider`, etc.
    - [ ] Team adapters: `@/adapters/team/TeamDataProvider`, `@/adapters/team/SupabaseTeamProvider`, etc.
  - [ ] Create a comprehensive import path migration guide for developers
    - [ ] List common incorrect paths and their correct replacements
    - [ ] Provide search patterns for finding incorrect imports
    - [ ] Document any special cases or exceptions

## Phase 12: Host Integration Examples

- [ ] Create sample integrations
  - [ ] Basic integration with default components
  - [ ] Custom UI integration
  - [ ] Custom service implementation
  - [ ] Feature toggling example

## Additional Notes

- All implementations must follow the existing file structure guidelines documented in `docs/Product documentation/File structure guidelines.md`
- All changes must be fully tested before considered complete
- Do not implement partial solutions - each feature should be fully implemented
- Batch related changes together and ensure they are complete before moving to the next phase