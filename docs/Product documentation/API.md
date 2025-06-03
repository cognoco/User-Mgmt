# API Documentation

## Authentication

### POST /api/auth/register
Register a new user.

```typescript
interface RegisterRequest {
  userType: 'private' | 'corporate';
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  companyWebsite?: string;
  department?: string;
  industry?: string;
  companySize?:
    | '1-10'
    | '11-50'
    | '51-200'
    | '201-500'
    | '501-1000'
    | '1000+'
    | 'Other/Not Specified';
  position?: string;
  acceptTerms: boolean;
}

interface RegisterResponse {
  message: string;
  user: User;
  companyAssociation?: {
    success: boolean;
    companyName?: string;
  } | null;
}
```

### POST /api/auth/login
Authenticate a user.

```typescript
interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  user: User;
  token: string;
  requiresMfa: boolean;
  expiresAt?: string;
}
```

### POST /api/auth/logout
End the current session.

An optional `callbackUrl` query parameter can be provided to redirect the user after logout.

```typescript
interface LogoutResponse {
  message: string;
}
```

### POST /api/auth/reset-password
Request a password reset.

```typescript
interface ResetPasswordRequest {
  email: string;
}
```

### POST /api/auth/verify-email
Verify user's email address.

```typescript
interface VerifyEmailRequest {
  token: string;
}
```

## User Profile

### GET /api/profile
Get the current user's profile.

### PUT /api/profile
Update the current user's profile.

```typescript
interface UpdateProfileRequest {
  name?: string;
  avatar?: File;
  bio?: string;
  settings?: UserSettings;
}
```

### DELETE /api/profile
Delete the current user's account.

## Two-Factor Authentication

### POST /api/2fa/enable
Enable 2FA for the current user.

```typescript
interface Enable2FARequest {
  method: '2fa_method';
  phoneNumber?: string;
}
```

### POST /api/2fa/verify
Verify 2FA setup.

```typescript
interface Verify2FARequest {
  code: string;
  method: '2fa_method';
}
```

### POST /api/2fa/disable
Disable 2FA for the current user.

## Organizations

### GET /api/organizations
List organizations for the current user.

### POST /api/organizations
Create a new organization.

```typescript
interface CreateOrganizationRequest {
  name: string;
  domain?: string;
  settings?: OrganizationSettings;
}
```

### GET /api/organizations/:id
Get organization details.

### PUT /api/organizations/:id
Update organization details.

### DELETE /api/organizations/:id
Delete an organization.

## Team Management

### GET /api/organizations/:id/members
List organization members.

### POST /api/organizations/:id/members
Add a member to the organization.

```typescript
interface AddMemberRequest {
  email: string;
  role: string;
}
```

### PUT /api/organizations/:id/members/:userId
Update member role.

### DELETE /api/organizations/:id/members/:userId
Remove a member from the organization.

## Settings

### GET /api/settings
Get user settings.

### PUT /api/settings
Update user settings.

```typescript
interface UpdateSettingsRequest {
  language?: string;
  theme?: 'light' | 'dark' | 'system';
  notifications?: NotificationSettings;
  privacy?: PrivacySettings;
}
```

## Subscription

### GET /api/subscription
Get current subscription status.

### POST /api/subscription/create
Create a new subscription.

```typescript
interface CreateSubscriptionRequest {
  planId: string;
  paymentMethodId: string;
}
```

### PUT /api/subscription/update
Update subscription.

### DELETE /api/subscription/cancel
Cancel subscription.

## Error Responses

All endpoints may return the following error responses:

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    /** optional categorisation such as `auth` or `validation` */
    category?: string;
  }
}
```

### Common Error Codes

| Code | Meaning | Retry Guidance |
|------|---------|----------------|
| `auth/unauthorized` | User is not authenticated | Authenticate and resend the request |
| `auth/forbidden` | User lacks required permissions | Verify permissions or contact an administrator |
| `validation/error` | Request body failed validation | Fix the input fields and retry immediately |
| `not_found` | Requested resource does not exist | Ensure the id or path is correct |
| `rate_limited` | Too many requests | Wait for the limit window to pass before retrying |
| `server_error` | Internal server error | Retry later; if persistent, contact support |

When handling errors on the client, check the `code` and surface a user friendly message using the mapping in `ERROR_CODE_DESCRIPTIONS`. All API clients should expect this structure and may implement automatic retries for server errors or rate limits.

## Authentication

All endpoints except `/api/auth/login` and `/api/auth/register` require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Versioning

The current API version is v1. Include the version in the URL:
```
/api/v1/[endpoint]
``` 