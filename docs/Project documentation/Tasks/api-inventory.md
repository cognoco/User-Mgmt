# API Inventory

This document provides a comprehensive inventory of all API endpoints across the User Management Module, categorized by domain and implementation status according to the new architecture guidelines.

## Implementation Status Categories

- **Fully Migrated**: API endpoint has been fully refactored to use the new architecture (adapter interfaces, services, etc.)
- **Partially Migrated**: API endpoint has some elements of the new architecture but is not fully compliant
- **Not Migrated**: API endpoint still uses the old architecture and needs to be refactored

## Auth Domain

| Endpoint | Method | Description | Implementation Status | Notes |
|----------|--------|-------------|----------------------|-------|
| `/api/auth/login` | POST | User login | Partially Migrated | Uses `getApiAuthService()` but still has direct database access |
| `/api/auth/register` | POST | User registration | Partially Migrated | Uses some new patterns but needs full adapter implementation |
| `/api/auth/logout` | POST | User logout | Not Migrated | Uses direct database access |
| `/api/auth/reset-password` | POST | Password reset | Not Migrated | Uses direct database access |
| `/api/auth/update-password` | POST | Update password | Not Migrated | Uses direct database access |
| `/api/auth/send-verification-email` | POST | Send verification email | Not Migrated | Uses direct database access |
| `/api/auth/mfa/enable` | POST | Enable MFA | Not Migrated | Uses direct database access |
| `/api/auth/mfa/disable` | POST | Disable MFA | Not Migrated | Uses direct database access |
| `/api/auth/mfa/verify` | POST | Verify MFA code | Not Migrated | Uses direct database access |
| `/api/auth/oauth/*` | Various | OAuth flows | Not Migrated | Uses direct database access |

## User Domain

| Endpoint | Method | Description | Implementation Status | Notes |
|----------|--------|-------------|----------------------|-------|
| `/api/profile/avatar` | GET, POST, DELETE | User avatar management | Not Migrated | Uses direct Supabase access |
| `/api/profile/business` | GET, POST | Business profile | Not Migrated | Uses direct database access |
| `/api/profile/export` | GET, POST | Export user data | Not Migrated | Uses direct database access |
| `/api/profile/verify` | POST | Verify user profile | Not Migrated | Uses direct database access |
| `/api/profile/notifications` | GET, POST | User notifications | Not Migrated | Uses direct database access |
| `/api/profile/privacy` | GET, POST | Privacy settings | Not Migrated | Uses direct database access |
| `/api/settings` | GET, PUT | User settings | Not Migrated | Uses direct database access |
| `/api/preferences` | GET, PUT | User preferences | Not Migrated | Uses direct database access |

## Team Domain

| Endpoint | Method | Description | Implementation Status | Notes |
|----------|--------|-------------|----------------------|-------|
| `/api/team/members` | GET | List team members | Not Migrated | Uses direct Prisma database access |
| `/api/team/members/[id]` | GET, PUT, DELETE | Manage team member | Not Migrated | Uses direct database access |
| `/api/team/invites` | GET, POST | Team invitations | Not Migrated | Uses direct database access |
| `/api/team/invites/[id]` | GET, PUT, DELETE | Manage invitation | Not Migrated | Uses direct database access |
| `/api/organizations` | GET, POST | Organizations | Not Migrated | Uses direct database access |
| `/api/organizations/[id]` | GET, PUT, DELETE | Manage organization | Not Migrated | Uses direct database access |

## Permissions Domain

| Endpoint | Method | Description | Implementation Status | Notes |
|----------|--------|-------------|----------------------|-------|
| `/api/permissions/check` | GET | Check permission | Not Migrated | Uses direct database access and old RBAC system |

## Admin Domain

| Endpoint | Method | Description | Implementation Status | Notes |
|----------|--------|-------------|----------------------|-------|
| `/api/admin/users` | GET | List all users | Not Migrated | Uses direct database access |
| `/api/admin/users/[id]` | GET, PUT, DELETE | Manage user | Not Migrated | Uses direct database access |
| `/api/admin/audit` | GET | Audit logs | Not Migrated | Uses direct database access |

## Other Domains

| Endpoint | Method | Description | Implementation Status | Notes |
|----------|--------|-------------|----------------------|-------|
| `/api/2fa/*` | Various | Two-factor authentication | Not Migrated | Uses direct database access |
| `/api/address` | GET, POST | User addresses | Not Migrated | Uses direct database access |
| `/api/api-keys` | GET, POST, DELETE | API key management | Not Migrated | Uses direct database access |
| `/api/audit` | GET | Audit logs | Not Migrated | Uses direct database access |
| `/api/csrf` | GET | CSRF token | Not Migrated | Basic implementation |
| `/api/gdpr/*` | Various | GDPR compliance | Not Migrated | Uses direct database access |
| `/api/notifications` | GET, POST | Notifications | Not Migrated | Uses direct database access |
| `/api/session` | GET, POST, DELETE | Session management | Not Migrated | Uses direct database access |
| `/api/sso/*` | Various | Single Sign-On | Not Migrated | Uses direct database access |
| `/api/subscription/*` | Various | Subscription management | Not Migrated | Uses direct database access |
| `/api/webhooks/*` | Various | Webhook management | Not Migrated | Uses direct database access |

## Common Patterns and Inconsistencies

### Common Patterns

1. **Authentication Pattern**: Most endpoints use a similar pattern for authentication, checking for a token in the Authorization header or using NextAuth's `getServerSession`.

2. **Error Handling Pattern**: Most endpoints follow a consistent try-catch pattern with specific error codes for different scenarios.

3. **Rate Limiting**: Many endpoints use the `checkRateLimit` middleware.

4. **Validation Pattern**: Most endpoints use Zod schemas for request validation.

### Inconsistencies

1. **Database Access**: Some endpoints use Prisma directly, while others use Supabase, creating inconsistency in the data access layer.

2. **Service Usage**: Only a few endpoints (like `/api/auth/login`) have started using the new service architecture with `getApiAuthService()`.

3. **Response Format**: Response formats vary across endpoints, with some returning wrapped objects and others returning direct data.

4. **Permission Checking**: Some endpoints use the `createProtectedHandler` middleware, while others implement permission checks inline.

5. **Logging**: Inconsistent use of audit logging across endpoints.

## Migration Strategy

Based on this inventory, the recommended migration strategy is:

1. **Create Adapter Interfaces**: Complete the database adapter interfaces for all domains (Auth, User, Team, Permissions).

2. **Implement Supabase Adapters**: Implement Supabase adapters for each interface.

3. **Migrate Auth Domain First**: Since some Auth endpoints are already partially migrated, complete these first.

4. **Migrate Core User Endpoints**: Next, migrate the core user profile endpoints.

5. **Migrate Team and Permissions**: Then migrate team and permissions endpoints.

6. **Migrate Admin and Other Domains**: Finally, migrate admin and other specialized domains.

7. **Standardize Patterns**: During migration, ensure consistent patterns for authentication, error handling, validation, and response formats.

## Migration Progress

- Total Endpoints: ~50
- Fully Migrated: 0 (0%)
- Partially Migrated: 2 (4%)
- Not Migrated: 48 (96%)
