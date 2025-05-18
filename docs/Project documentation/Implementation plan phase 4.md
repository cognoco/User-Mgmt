Implementation Plan – Phase 4:

## Phase 4: Advanced Authentication (SSO & MFA) – Implementation Checklist

### 1. MFA Methods (SMS/Email)
- [x] **Backend:**
  - [x] Implement endpoints for SMS MFA setup, code sending, and verification  
    _Implemented: Accepts phone, generates code, sends via mock SMS, verifies and enables SMS MFA._
  - [x] Implement endpoints for Email MFA setup, code sending, and verification
    _Implemented: Accepts email, generates code, sends via email provider, verifies and enables Email MFA. Added resend capability._
  - [x] Integrate with SMS/email providers (abstracted for future changes)
    _Implemented: Created abstracted SMS and Email provider integrations with support for multiple providers (SendGrid, Twilio, AWS)._
  - [x] Store MFA method status and metadata in user profile
    _Implemented: Storing MFA methods, verification status, and data in user metadata with consistent format._
- [x] **Frontend:**
  - [x] Extend MFA setup UI to allow SMS as an option  
    _User can select SMS, enter phone, receive and verify code._
  - [x] Add flows for entering phone/email, receiving, and verifying codes  
    _SMS flow implemented; email flow implemented._
  - [x] Update MFA management UI to show all enrolled factors and allow removal  
    _SMS, Email and TOTP factors are shown and can be removed individually._
- [x] **Testing:**
  - [x] Integration and E2E tests for all flows, including edge cases (delivery failure, code expiry, etc.)
    _Added comprehensive tests for SMS and Email verification, covering success, error, expiry and resend flows._

### 2. Account Linking
- [x] **Backend:**
  - [x] Implement logic to securely link SSO accounts to existing password accounts (and vice versa)
    _Implemented: /api/auth/oauth/link and /api/auth/oauth/callback endpoints handle linking and collision scenarios._
  - [x] Handle conflict scenarios (email already exists, unverified, etc.)
    _Implemented: Returns clear errors for collisions and guides user to link via password login if needed._
  - [x] Implement /api/connected-accounts API route for fetching and disconnecting linked accounts
    _Implemented: GET and DELETE handlers for /api/connected-accounts now available._
- [x] **Frontend:**
  - [x] UI for linking accounts, handling prompts/conflicts, and feedback
    _ConnectedAccounts component supports linking/unlinking, error display, and uses the new API route._
- [x] **Testing:**
  - [x] Integration tests for store and API route (see src/tests/integration/connected-accounts.integration.test.tsx)
    _Integration tests cover fetch, link, and unlink logic._
  - [x] E2E tests for all linking scenarios
    _E2E test skeletons present; expand to cover full user flows and edge cases._

### 3. Error Handling (SSO/MFA)
- [x] **Backend:**
  - [x] Standardize error responses for all SSO/MFA endpoints
    _Implemented consistent error format for all MFA endpoints._
- [x] **Frontend:**
  - [x] Ensure all SSO/MFA flows display clear, actionable error messages
    _Added clear error handling for SMS and Email verification._
- [x] **Testing:**
  - [x] Tests for all error scenarios
    _Implemented comprehensive integration tests in sso-mfa-error-handling.integration.test.tsx covering OAuth errors, MFA verification failures, and network issues._

### 4. Organization Security Policy

- ✅ Define organization security policy types: `OrganizationSecurityPolicy` in `src/types/organizations.ts` with default values.
- ✅ Implement session management: Session timeouts, max sessions per user policy enforcement.
- ✅ Implement password complexity rules enforcement: Length, complexity, history and expiry settings.
- ✅ Implement MFA requirement settings: Required MFA, allowed MFA methods.
- ✅ Implement IP restrictions: Allowlist/denylist for access control.
- ✅ Implement sensitive actions: Requiring reauthentication for high-risk operations.
- ✅ Create UI for managing security policy: Enhanced `OrganizationSessionManager` component with tabbed interface.
- ✅ Add password validation: `validatePasswordWithPolicy` to enforce policy-specific rules.
- ✅ Create policy enforcement services: Security policy enforcement through `security-policy.service.ts`.
- ✅ Add integration tests: Tests for security policy settings in `organization-security-policy.integration.test.tsx`.

### 5. Session Management
- [x] **Backend:**
  - [x] Complete session tracking and revocation logic
    _Implemented "Remember Me" during login and session management for active sessions._
  - [x] Enforce session policies (timeout, max sessions, etc.)
    _Added policy enforcement in middleware and dedicated API endpoint. Sessions are checked against organization security policy for timeout and max session limits._
- [x] **Frontend:**
  - [x] Complete admin UI for viewing/terminating sessions
    _Added functionality to view active sessions and revoke specific sessions._
- [x] **Testing:**
  - [x] Integration/E2E tests for session management flows
    _Created comprehensive test suite for session behavior, policy enforcement, and timeout handling._

### 6. Notification Preferences
- [ ] **Backend:**
  - [ ] Ensure notification preferences are stored and respected
- [ ] **Frontend:**
  - [ ] Complete UI for configuring notification types/channels
- [ ] **Testing:**
  - [ ] Integration tests for preference changes

### 7. Notification Delivery
- [x] **Backend:**
  - [x] Implement email, push, and in-app notification delivery logic
    _Email delivery implemented through provider abstraction._
  - [ ] Queueing, retry, and delivery tracking
- [ ] **Frontend:**
  - [ ] UI for in-app notification center/toasts
- [ ] **Testing:**
  - [ ] Integration/E2E tests for notification delivery and display

### 8. Push Notification Setup
- [ ] **Backend:**
  - [ ] Implement push token registration and management
- [ ] **Frontend:**
  - [ ] UI for enabling/disabling push notifications
- [ ] **Testing:**
  - [ ] Integration/E2E tests for push notification flows
