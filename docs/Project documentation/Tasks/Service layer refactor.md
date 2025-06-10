Refactoring Task Breakdown
Phase 2: Refactor Core Service Layer (3-5 days)
2.1 Update Service Interfaces (1 day)
Affected Files:

src/core/auth/interfaces.ts
src/core/user/interfaces.ts
src/core/team/interfaces.ts
src/core/permission/interfaces.ts
src/core/session/interfaces.ts
src/core/sso/interfaces.ts
src/core/notification/interfaces.ts
src/core/api-keys/interfaces.ts
src/core/address/interfaces.ts
src/core/audit/interfaces.ts
src/core/csrf/interfaces.ts
src/core/gdpr/interfaces.ts
src/core/subscription/interfaces.ts
src/core/webhook/interfaces.ts
Tasks:

Review each service interface to ensure alignment with data provider capabilities
Update method signatures to match data provider patterns
Add comprehensive JSDoc documentation for expected behaviors
Document error handling patterns
Ensure consistent return types across all interfaces
2.2 Refactor Service Implementations (Per Domain) (2-3 days)
2.2.1 Auth Service
Affected Files:

src/services/auth/default-auth.service.ts
src/services/auth/factory.ts
src/services/auth/__tests__/auth.store.test.ts
Tasks:

Update constructor to remove API client dependency
Replace direct API calls with data provider calls in all methods:
login
register
logout
resetPassword
updatePassword
sendVerificationEmail
verifyEmail
deleteAccount
setupMFA
verifyMFA
disableMFA
refreshToken
Move business logic from API response handling to service layer
Update error handling to work with data provider errors
Update unit tests to work with the refactored service
2.2.2 User Service
Affected Files:

src/services/user/default-user.service.ts
src/services/user/factory.ts
src/services/user/__tests__/factory.test.ts
Tasks:

Update constructor to remove API client dependency
Replace direct API calls with data provider calls in all methods:
getUserProfile
updateUserProfile
updateUserSettings
uploadProfileImage
deleteProfileImage
getConnectedAccounts
connectAccount
disconnectAccount
Move business logic from API response handling to service layer
Update error handling to work with data provider errors
Update unit tests to work with the refactored service
2.2.3 Team Service
Affected Files:

src/services/team/default-team.service.ts
src/services/team/factory.ts
src/services/team/__tests__/factory.test.ts
Tasks:

Update constructor to remove API client dependency
Replace direct API calls with data provider calls in all methods:
createTeam
updateTeam
deleteTeam
getTeams
getTeamById
getTeamMembers
inviteTeamMember
removeTeamMember
updateTeamMemberRole
Move business logic from API response handling to service layer
Update error handling to work with data provider errors
Update unit tests to work with the refactored service
2.2.4 Permission Service
Affected Files:

src/services/permission/default-permission.service.ts
src/services/permission/factory.ts
src/services/permission/__tests__/factory.test.ts
Tasks:

Update constructor to remove API client dependency
Replace direct API calls with data provider calls in all methods:
getRoles
getPermissions
assignRole
removeRole
createRole
updateRole
deleteRole
Move business logic from API response handling to service layer
Update error handling to work with data provider errors
Update unit tests to work with the refactored service
2.2.5 Additional Services
Affected Files:

src/services/session/default-session.service.ts
src/services/sso/default-sso.service.ts
src/services/notification/default-notification.service.ts
src/services/csrf/default-csrf.service.ts
src/services/csrf/browser-csrf.service.ts
src/services/gdpr/default-gdpr.service.ts
src/services/subscription/default-subscription.service.ts
src/services/webhook/default-webhook.service.ts
src/services/api-keys/default-api-keys.service.ts
src/services/address/default-address.service.ts
src/services/audit/default-audit.service.ts
Tasks:

Update constructor to remove API client dependency
Replace direct API calls with data provider calls in all methods
Move business logic from API response handling to service layer
Update error handling to work with data provider errors
Update unit tests to work with the refactored service
2.3 Update Service Factories (1 day)
Affected Files:

src/services/auth/factory.ts
src/services/user/factory.ts
src/services/team/factory.ts
src/services/permission/factory.ts
src/services/session/factory.ts
src/services/sso/factory.ts
src/services/notification/factory.ts
src/services/csrf/factory.ts
src/services/gdpr/factory.ts
src/services/subscription/factory.ts
src/services/webhook/factory.ts
src/services/api-keys/factory.ts
src/services/address/factory.ts
src/services/audit/factory.ts
Tasks:

Remove API client instantiation
Update to only require data providers
Ensure proper dependency injection
Update factory tests to reflect new patterns
Phase 3: Update Data Providers (2-3 days)
3.1 Extend Data Provider Interfaces (1 day)
Affected Files:

src/core/auth/IAuthDataProvider.ts
src/core/user/IUserDataProvider.ts
src/core/team/ITeamDataProvider.ts
src/core/permission/IPermissionDataProvider.ts
src/core/session/ISessionDataProvider.ts
src/core/sso/ISsoDataProvider.ts
src/core/notification/INotificationDataProvider.ts
src/core/api-keys/IApiKeyDataProvider.ts
src/core/address/IAddressDataProvider.ts
src/core/audit/IAuditDataProvider.ts
src/core/csrf/ICsrfDataProvider.ts
src/core/gdpr/IGdprDataProvider.ts
src/core/subscription/ISubscriptionDataProvider.ts
src/core/webhook/IWebhookDataProvider.ts
Tasks:

Add missing methods needed by services
Ensure consistent error handling patterns
Update method signatures to match service requirements
Add comprehensive documentation
3.2 Implement New Data Provider Methods (1-2 days)
Affected Files:

src/adapters/auth/supabase/supabase-auth.provider.ts
src/adapters/user/supabase/supabase-user.provider.ts
src/adapters/team/supabase/supabase-team.provider.ts
src/adapters/permission/supabase/supabase-permission.provider.ts
src/adapters/session/supabase/supabase-session.provider.ts
src/adapters/sso/supabase/supabase-sso.provider.ts
src/adapters/notification/supabase/supabase-notification.provider.ts
src/adapters/api-keys/supabase/supabase-api-keys.provider.ts
src/adapters/address/supabase/supabase-address.provider.ts
src/adapters/audit/supabase/supabase-audit.provider.ts
src/adapters/csrf/supabase/supabase-csrf.provider.ts
src/adapters/gdpr/supabase/supabase-gdpr.provider.ts
src/adapters/subscription/supabase/supabase-subscription.provider.ts
src/adapters/webhook/supabase/supabase-webhook.provider.ts
Tasks:

Implement new methods required by services
Ensure proper error handling and type safety
Add unit tests for new methods
Ensure consistent patterns across all providers
Phase 4: Update API Routes (1-2 days)
4.1 Refactor Route Handlers (1 day)
Affected Files:

src/pages/api/auth/[...auth].ts
src/pages/api/user/[...user].ts
src/pages/api/team/[...team].ts
src/pages/api/permission/[...permission].ts
src/pages/api/session/[...session].ts
src/pages/api/sso/[...sso].ts
src/pages/api/notification/[...notification].ts
src/pages/api/api-keys/[...api-keys].ts
src/pages/api/address/[...address].ts
src/pages/api/audit/[...audit].ts
src/pages/api/csrf/[...csrf].ts
src/pages/api/gdpr/[...gdpr].ts
src/pages/api/subscription/[...subscription].ts
src/pages/api/webhook/[...webhook].ts
Tasks:

Update to work with refactored services
Ensure proper error handling and response formatting
Update to use factory functions instead of direct instantiation
Ensure consistent patterns across all API routes
4.2 Update Middleware (1 day)
Affected Files:

src/middleware/auth.middleware.ts
src/middleware/csrf.middleware.ts
src/middleware/rate-limit.middleware.ts
src/middleware/validation.middleware.ts
Tasks:

Ensure authentication/authorization still works with refactored services
Update any request/response transformations
Update error handling to match new patterns
Ensure proper integration with service layer
Implementation Notes
Interface-First Approach: Follow the architecture guidelines by ensuring all changes maintain the interface-first design pattern.
Testing Strategy:
Update tests incrementally as each service is refactored
Ensure test coverage remains high
Create new tests for any new functionality
Dependency Injection:
Ensure all services receive their dependencies through constructor injection
Use factory functions to create and configure services
Error Handling:
Implement consistent error handling patterns across all services
Ensure errors from data providers are properly translated to service-level errors
Documentation:
Add comprehensive JSDoc comments to all interfaces and methods
Document expected behaviors and error conditions