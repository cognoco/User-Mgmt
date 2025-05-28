
# User Management Module - APIs & Services Checklist

This checklist tracks the existence of API endpoints for the User Management Module. Authentication endpoints are verified below. Each entry lists the expected route path and whether a corresponding `route.ts` file currently exists in the repository.

## Authentication API Endpoints


# User Management Module: APIs, Services, Factories & Adapters Checklist

---

## General Criteria (Apply to All)

- [ ] **Interface-First:** All logic behind TypeScript interfaces
- [ ] **Pluggable:** Adapters are replaceable (e.g., Supabase, custom, etc.)
- [ ] **Separation of Concerns:** No business logic in UI; all in services/adapters
- [ ] **Test Coverage:** Each endpoint/service has unit/integration tests
- [ ] **Error Handling:** Consistent, documented error responses
- [ ] **Documentation:** JSDoc for all interfaces, methods, and error patterns
- [ ] **Toggleable Features:** All features are toggleable/configurable
- [ ] **No Host App Assumptions:** No global shell, navigation, or PWA logic

---

## 1. Authentication

**API Endpoints:**
- [x] `/api/auth/login`
- [x] `/api/auth/register`
- [x] `/api/auth/logout`
- [x] `/api/auth/refresh-token`
- [x] `/api/auth/send-verification-email`
- [x] `/api/auth/verify-email`
- [x] `/api/auth/reset-password`
- [x] `/api/auth/update-password`
- [x] `/api/auth/delete-account`
- [x] `/api/auth/setup-mfa`
- [x] `/api/auth/verify-mfa`
- [x] `/api/auth/disable-mfa`
- [x] `/api/auth/mfa/enable`
- [x] `/api/auth/mfa/disable`

**Core Implementation:**
- [ ] `AuthService` (interface & implementation)
- [ ] `authServiceFactory`
- [ ] `AuthDataProvider` (e.g., Supabase, custom)

---

## 2. User Profile & Account Management

**API Endpoints:**
 - [x] `/api/profile` (GET, PATCH)
 - [x] `/api/settings` (GET, PATCH)
 - [x] `/api/profile/avatar` (GET, POST, DELETE) - canonical
 - [x] `/api/user/avatar` (alias, DEPRECATED)
 - [x] `/api/connected-accounts` (GET, DELETE)
 - [x] `/api/user/connected-accounts` (alias, POST handled by `/api/auth/oauth/link`, DEPRECATED)

**Core Implementation:**
 - [x] `UserService`
 - [x] `userServiceFactory`
 - [x] `UserDataProvider`

---

## 3. Team & Organization Management

**API Endpoints:**
- [ ] `/api/team` (GET, POST)
- [ ] `/api/team/[teamId]` (GET, PATCH, DELETE)
- [ ] `/api/team/members` (GET, POST)
- [ ] `/api/team/members/[memberId]` (GET, PATCH, DELETE)
- [ ] `/api/team/invites` (GET, POST)
- [ ] `/api/team/invites/accept` (POST)
- [ ] `/api/team/roles` (GET, POST, PATCH, DELETE)
- [ ] `/api/team/permissions` (GET, POST, PATCH, DELETE)

**Core Implementation:**
- [ ] `TeamService`
- [ ] `teamServiceFactory`
- [ ] `TeamDataProvider`

---

## 4. Permissions & Roles

**API Endpoints:**
- [x] `/api/permissions` (GET, POST, PATCH, DELETE)
- [x] `/api/roles` (GET, POST, PATCH, DELETE)

**Core Implementation:**
- [ ] `PermissionService`
- [ ] `permissionServiceFactory`
- [ ] `PermissionDataProvider`

---

## 5. Session Management

**API Endpoints:**
- [x] `/api/session` (GET, DELETE)

**Core Implementation:**
- [x] `SessionService`
- [x] `sessionServiceFactory`
- [x] `SessionDataProvider`

---

## 6. SSO (Single Sign-On) & Account Linking

**API Endpoints:**
- [ ] `/api/sso/login`
- [ ] `/api/sso/link`
- [ ] `/api/sso/unlink`

**Core Implementation:**
- [ ] `SsoService`
- [ ] `ssoServiceFactory`
- [ ] `SsoDataProvider`

---

## 7. API Keys Management

**API Endpoints:**
- [ ] `/api/api-keys` (GET, POST, DELETE)

**Core Implementation:**
- [ ] `ApiKeyService`
- [ ] `apiKeyServiceFactory`
- [ ] `ApiKeyDataProvider`

---

## 8. Webhooks

**API Endpoints:**
- [ ] `/api/webhooks` (GET, POST, DELETE)
- [ ] `/api/webhooks/stripe` (POST)

**Core Implementation:**
- [ ] `WebhookService`
- [ ] `webhookServiceFactory`
- [ ] `WebhookDataProvider`

---

## 9. Subscription & Billing

**API Endpoints:**
- [x] `/api/subscriptions/checkout`
- [x] `/api/subscriptions/portal`
- [x] `/api/subscriptions/status`
- [x] `/api/subscriptions/cancel`

**Core Implementation:**
- [ ] `SubscriptionService`
- [ ] `subscriptionServiceFactory`
- [ ] `SubscriptionDataProvider`

---

## 10. Audit Logging

**API Endpoints:**
- [x] `/api/audit` (GET)

**Core Implementation:**
- [x] `AuditService`
- [x] `auditServiceFactory`
- [x] `AuditDataProvider`

---

## 11. Notification & Communication Preferences

**API Endpoints:**
- [ ] `/api/notifications` (GET, PATCH)
- [ ] `/api/notifications/preferences` (GET, PATCH)

**Core Implementation:**
- [ ] `NotificationService`
- [ ] `notificationServiceFactory`
- [ ] `NotificationDataProvider`

---

## 12. Compliance & Legal

**API Endpoints:**
- [x] `/api/gdpr/export` (POST)
- [x] `/api/gdpr/delete` (POST)
- [x] `/api/consent` (GET, POST)

**Core Implementation:**
- [x] `GdprService`, `ConsentService`
- [x] `gdprServiceFactory`, `consentServiceFactory`
- [x] `GdprDataProvider`, `ConsentDataProvider`

---

## 13. CSRF & Security Middleware

**API Endpoints:**
- [ ] `/api/csrf` (GET)
- [ ] `/api/csrf/validate` (POST)
- [ ] `/api/csrf/revoke` (DELETE)

**Core Implementation:**
- [ ] `CsrfService`
- [ ] `csrfServiceFactory`
- [ ] `CsrfDataProvider`

**Middleware:**
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Security headers
- [ ] Audit logging

**Criteria:**
- [ ] All security middleware interface-based and pluggable
- [ ] All middleware tested

---

> **Instructions:**
> - Mark each item as complete `[x]` as you implement and verify it.
> - Add links to code/docs as needed for traceability.
> - Update this checklist as requirements evolve. 

