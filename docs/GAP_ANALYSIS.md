# Gap Analysis - User Management System

This document identifies features required by the project's phase documentation (`docs/functionality-features-phase*.md`) that are **not** marked as complete (or are only mocked) in the `docs/IMPLEMENTATION_CHECKLIST.md` and `docs/BUSINESS_PROFILE_AUDIT_PLAN.md`.

## Phase 3: Business User Registration & Core Profile Gaps

Based on `docs/functionality-features-phase3.md`:

*   **3.3 Update Business Profile (Address Specifics):** (Implemented, except Validation)
    *   ✅ Structured address fields (Street Line 1/2, City, State/Province, Postal Code, Country dropdown) added to `CompanyProfileForm`.
    *   ✅ Country dropdown populated with a list.
    *   ✅ Zod schema (`companyProfileSchema` in form) includes address structure.
    *   ✅ Type definition (`CompanyProfile` in `types/company.ts`) updated to include optional `address`.
    *   ✅ Store action (`updateProfile` in `companyProfileStore.ts`) updated to handle sending profile and primary address data.
    *   ✅ Backend API endpoints (`PUT /api/company/profile`, `POST /api/company/addresses`, `PUT /api/company/addresses/:id`) verified to correctly handle saving profile and address data.
    *   **Gaps:**
        *   Address validation (Phase 3, Sec 3.5) is handled separately (see item 3.5 below).
*   **3.4 Company Logo Upload (`/api/profile/logo`):** (Implemented)
*   **3.5 Address Validation:** (Partially Implemented - Google API)
    *   ✅ Backend schema/routes (`company_addresses`) updated to accept optional `validated` flag.
    *   ✅ Backend API route (`POST /api/address/validate`) created to call Google Address Validation API (requires API key setup).
    *   ✅ Frontend (`CompanyProfileForm`) updated with validation button, state management, API call logic, and status display.
    *   ✅ Frontend submission logic updated to pass `validated: true` flag when appropriate.
    *   **Gaps:**
        *   **Action Required:** User needs to obtain a Google Maps API Key (with Address Validation API enabled) and set it as the `GOOGLE_MAPS_API_KEY` environment variable for the backend.
        *   Handling invalid addresses: Currently shows a message; logic for disabling profile/sending notifications after 48 hours needs implementation (likely involves cron jobs or scheduled tasks based on `validated` status and `updated_at`).
        *   Displaying suggestions: Frontend currently stores suggestions but doesn't display them or allow users to apply them.
*   **Connected Accounts in Profile:** (UI + Integration Tests Implemented)
    *   ✅ ConnectedAccounts component is now rendered in the profile editor.
    *   ✅ Integration tests for linking and unlinking accounts in the profile editor are implemented (`ProfileEditor.test.tsx`).
    *   **Gaps:**
        *   E2E tests for linking/unlinking accounts from the profile page are still missing.
*   **3.6 Company Validation (`/api/company/validate`):** (Partially Implemented - Structure Only)
    *   ✅ Database schema (`company_profiles` table) updated with `*_verified`, `*_last_checked`, `*_validation_details` columns for registration number and tax ID.
    *   ✅ Frontend (`CompanyProfileForm`) validation handlers updated to get country code and call new API routes (`/api/company/validate/...`).
    *   ✅ Placeholder backend API routes created (`/api/company/validate/registration`, `/api/company/validate/tax`) with authentication and request parsing.
    *   ✅ Old mock routes (`/api/registry/...`) deleted.
    *   **Gaps:**
        *   Core backend logic: Need to identify and integrate country-specific external validation APIs (e.g., VIES, Companies House) within the placeholder routes.
        *   Database update logic within backend routes needs to be implemented (using the new schema columns).
        *   Frontend needs to properly display validation status based on API response and potentially persisted DB state.
*   **3.7 Business Domain Verification (`/api/company/verify-domain`):** (Implemented - DNS TXT Method)
    *   ✅ Database schema (`company_profiles`) updated with `domain_name`, `domain_verification_token`, `domain_verified`, `domain_last_checked` columns.
    *   ✅ Backend API route (`POST /api/company/verify-domain/initiate`) created to generate/store token and domain.
    *   ✅ Backend API route (`POST /api/company/verify-domain/check`) created to perform DNS TXT lookup and update verification status.
    *   ✅ Frontend component (`DomainVerification`) created to display status/token/instructions and trigger initiate/check actions.
    *   ✅ Component integrated into Company Profile page (`app/company/profile/page.tsx`).
    *   **Gaps/Future:**
        *   Consider adding other verification methods (Email, HTML file) if needed.
        *   Ensure robustness of DNS lookup (handling timeouts, multiple TXT records more gracefully).
        *   Consider clearing the verification token from the database after successful verification.

## Phase 4: Testing & Security Gaps

Based on checklist items aligned with the "Testing & Security" phase title and general best practices (details may need further specification):

*   **Security Features:**
    *   **Rate Limiting:** ✅ Implemented with Redis-based rate limiting and LRU cache fallback. Includes:
        - Basic rate limiting on all endpoints
        - Stricter limits on auth endpoints
        - Configurable windows and limits
        - Tests in place
    *   **Security Headers:** ✅ Configured in Next.js application with:
        - Content Security Policy (CSP)
        - HTTP Strict Transport Security (HSTS)
        - X-XSS-Protection
        - X-Frame-Options
        - Permissions Policy
        - X-Content-Type-Options
        - Referrer Policy
        - CORS headers for API routes
    *   **Audit Logging:** 🟡 Partially Implemented:
        - ✅ New table `user_actions_log` created for semantic audit events.
        - ✅ Helper function `logUserAction` created in `src/lib/audit/auditLogger.ts`.
        - ✅ Logging integrated into key API routes:
          - Login (`/api/auth/login`)
          - Registration (`/api/auth/register`)
          - Password Reset Request (`/api/auth/reset-password`)
          - Password Update (`/api/auth/update-password`)
          - Privacy Settings Update (`/api/profile/privacy`)
          - Company Profile (Create, Update, Delete - `/api/company/profile`)
        - **Gaps:**
          - Logging for personal profile updates.
          - Logging for 2FA changes.
          - Logging for Account Deletion flows.
          - Logging for Role/permission changes.
          - Review/refine logged `details` for sensitivity and usefulness.
          - Sanitization review for original `audit_logs` table (middleware logs).
          - Create log viewing/filtering interface for admins in the UI.
    *   **Unverified User Cleanup:** ❌ Not Implemented:
        - Implement a mechanism (e.g., scheduled database/edge function) to automatically delete user accounts from `auth.users` (and related tables like `profiles`) where `email_confirmed_at` is null and `created_at` is older than a defined period (e.g., 24 hours).
        - Ensure cascading deletes or manual cleanup handles related data (profiles, settings, etc.) appropriately.
*   **API Integration:**
    *   **API Documentation:** ❌ Need to implement:
        - OpenAPI/Swagger documentation
        - API versioning strategy
        - Rate limit documentation
        - Error response standardization
*   **Testing Strategy:**
    *   **Unit Tests Setup & Coverage:** Framework established. Basic tests added for `company/profile` and `company/addresses` APIs, and `preferences.store`. **Gaps remain** for: `CompanyProfileForm`, `VerificationStatus`, `DataExport`, `AccountDeletion` components; `/api/profile/logo`, `/api/registry/*`, `/api/preferences`, `/api/gdpr/*` API routes; `profile.store` verification; hook/middleware coverage verification.
    *   **Integration Tests Setup & Coverage:** Framework established. Basic tests added for `company/profile`, `company/addresses`, `preferences.store`, search/sharing. 
        *   ✅ **Registration Flow:** Core form submission, validation, and successful call to Supabase (via store) covered by updated integration test (`RegistrationForm.integration.test.tsx`).
        *   🟡 **Login+MFA:** Needs implementation.
        *   🟡 **Password Reset:** Needs implementation.
        *   🟡 **Profile Update (Personal/Company):** Needs implementation.
        *   🟡 **Settings Update (Notifications/Theme/GDPR):** Needs implementation.
        *   🟡 **Company Setup (including registry mocks):** Needs implementation.
    *   **Unverified User Cleanup Tests:** ❌ Need to implement:
        - Create tests to verify the automatic cleanup mechanism.
        - Tests should involve creating unverified users, simulating time passage (or manually triggering the cleanup function), and asserting that the correct users (and related data) are deleted.
    *   **Registration Error Handling & Edge Cases Tests:** 🟡 Partially Addressed:
        *   Core validation errors tested.
        *   ✅ Successful registration path tested.
        *   ✅ Registration with existing *unverified* email handled (store provides feedback, test can be added).
        *   ❌ Test registration with an already *verified* email.
        *   ❌ Test registration with network/server errors during `signUp`.
        *   ❌ Test *intended* verification link expiry (> configured time).
    *   **E2E Tests Setup & Coverage:** Choose and configure an End-to-End testing framework (e.g., Playwright, Cypress) to test critical user journeys across the application.
    *   **Security Testing:** Plan and potentially execute security tests (e.g., dependency vulnerability scanning, basic penetration testing checks). Define scope and tools.
    *   **Performance Testing:** Plan and potentially execute performance tests (e.g., load testing on key API endpoints, front-end bundle size analysis, lighthouse scores). Define scope and tools.
    *   **Address Known Issues:** Resolve existing test issues documented in `TESTING_ISSUES.md` (e.g., `LoginForm` ref warning). Note: Original `RegistrationForm` timeout issue might be resolved by fixing the flow.
*   **Additional Features (Likely Phase 4 or related):**
    *   **Account Recovery Options:** Implement additional account recovery methods beyond password reset (e.g., security questions, recovery email verification flow). Requires UI, API endpoints, and secure storage.
    *   **Email Notifications System:** Develop or integrate a robust system for sending various transactional emails (e.g., welcome email, security alerts, notification preferences digests), possibly using a third-party service (e.g., SendGrid, Resend). Requires abstracting email sending logic.
    *   **Registration Re-attempt UX:** ✅ Addressed:
        *   The client-side `signUp` flow handles this correctly (Supabase resends email). 
        *   The `auth.store.ts` provides specific user feedback ("Registration already started. A new verification email has been sent...").
        *   UI should display this message from the store's `successMessage` state.
    *   **Verification Page Error Handling (Expected Expiry):** ❌ Need to implement:
        - Enhance `/verify-email/page.tsx` to parse URL fragments/parameters for specific Supabase error codes (like `otp_expired` after the expected timeout) and display tailored messages (e.g., "Verification link expired. Please request a new one.").
    *   **Verification Pages Direct Navigation UX:** 🟡 Needs Improvement:
        - Enhance `/verify-email/page.tsx` and `/check-email/page.tsx` to provide clearer guidance or fallbacks when users navigate directly without required context (e.g., missing email param for resend, no active verification flow).
    *   **Registration Network/Server Error UX:** 🟡 Partially Addressed (basic error display exists, needs refinement).
    *   **Redirect Logged-in Users from Public Auth Pages:** 🟡 Needs Implementation (Code Exists):
        - Uncomment the existing logic in `src/middleware.ts` (lines 41-44) to redirect authenticated users away from `/login` and `/register` pages.
*   **Role/Permission Management UI:** (UI + Integration Tests Implemented)
    *   ✅ RoleManagementPanel component is now rendered in the admin panel.
    *   ✅ Integration tests for listing, assigning, removing roles, and permissions viewer are implemented (`RoleManagementPanel.test.tsx`).
    *   **Gaps:**
        *   E2E tests for role/permission management UI are still missing.

## Phase 5: Subscriptions, Licensing, Org/Team Management & Deployment Gaps

Based on `docs/functionality-features-phase5.md` and checklist items:

*   **Subscriptions & Licensing (From Phase 5 Doc):**
    *   Define Subscription Tiers & Feature Gating Logic
    *   Integrate Payment Provider (e.g., Stripe, Lemon Squeezy) - (Checklist item)
    *   Implement Subscription Management UI/API (Purchase, Upgrade, Downgrade, Cancel flows)
    *   Implement Invoice Generation/Access
    *   Implement Usage Tracking (if needed for metered billing)
    *   Implement Trial Management Logic
    *   Design and Implement Team/Seat Licensing Models (linking subscriptions to multiple users)
*   **Organization/Team Management (Likely Phase 6, but required for Seat Licensing):**
    *   Team Creation/Management UI/API
    *   User Invitation System (sending/accepting invites)
    *   Role Management within Teams/Organizations
*   **Additional Features (Checklist):**
    *   **Activity Logging:** Define scope (user-facing feed vs. admin/audit log) and implement. Needs distinction from Audit Logging if both are required.
    *   **Multi-device Session Management:** Allow users to view and revoke their active login sessions. Requires storing session data appropriately and building UI/API for management.
*   **Address Known Issues:** Resolve existing test issues documented in `TESTING_ISSUES.md` (e.g., `RegistrationForm` timeouts, `LoginForm` ref warning).
*   **Re-registration Test:** ❌ Need to implement:
    - Create tests to verify that attempting to register with an existing, unverified email successfully triggers a new verification email send.
    - Once the improved UX is implemented (see "Registration Re-attempt UX" gap), update tests to assert that the specific user feedback message is displayed.
*   **Additional Features (Likely Phase 4 or related):**
    *   **Account Recovery Options:** Implement additional account recovery methods beyond password reset (e.g., security questions, recovery email verification flow). Requires UI, API endpoints, and secure storage.
*   **Email Notifications System:** Develop or integrate a robust system for sending various transactional emails (e.g., welcome email, security alerts, notification preferences digests), possibly using a third-party service (e.g., SendGrid, Resend). Requires abstracting email sending logic.
*   **Registration Re-attempt UX:** ✅ Addressed:
    - The client-side `signUp` flow handles this correctly (Supabase resends email). 
    - The `auth.store.ts` provides specific user feedback ("Registration already started. A new verification email has been sent...").
    - UI should display this message from the store's `successMessage` state.
*   **Verification Page Error Handling (Expected Expiry):** ❌ Need to implement:
    - Enhance `/verify-email/page.tsx` to parse URL fragments/parameters for specific Supabase error codes (like `otp_expired` after the expected timeout) and display tailored messages (e.g., "Verification link expired. Please request a new one.").
*   **Verification Pages Direct Navigation UX:** 🟡 Needs Improvement:
    - Enhance `/verify-email/page.tsx` and `/check-email/page.tsx` to provide clearer guidance or fallbacks when users navigate directly without required context (e.g., missing email param for resend, no active verification flow).
*   **Registration Network/Server Error UX:** 🟡 Partially Addressed (basic error display exists, needs refinement).
*   **Redirect Logged-in Users from Public Auth Pages:** 🟡 Needs Implementation (Code Exists):
    - Uncomment the existing logic in `src/middleware.ts` (lines 41-44) to redirect authenticated users away from `/login` and `/register` pages.

## Subscription Management System

### 1. Payment Infrastructure

#### Database Schema
- ✅ Enhanced subscriptions table with new columns
- ✅ Created subscription_plans table
- ✅ Created payment_history table
- ✅ Added necessary indexes and triggers

#### Stripe Integration Gaps
- 🟡 Core Setup
  - [ ] Stripe SDK integration needs to be completed
  - [ ] Webhook configuration needs to be implemented
  - [ ] Error management system needs enhancement
  - [ ] Environment-specific configuration setup needed

- 🟡 Customer Management
  - [ ] Customer creation flow needs implementation
  - [ ] Customer update functionality required
  - [ ] Metadata handling system needed
  - [ ] Customer portal setup pending

### 2. API Implementation

#### Billing Management Gaps
- 🟡 Invoices
  - [ ] GET /api/billing/invoices endpoint needs implementation
  - [ ] GET /api/billing/upcoming-invoice endpoint needs implementation

#### Usage Tracking Gaps
- ❌ All endpoints need implementation:
  - [ ] POST /api/usage/record
  - [ ] GET /api/usage/current
  - [ ] GET /api/usage/history

### 3. Frontend Components

#### Billing Management Gaps
- 🟡 InvoiceHistory component needs:
  - [ ] Filtering functionality
  - [ ] Download options
  - [ ] Payment status display
  - [ ] Pagination

#### Usage Dashboard Gaps
- ❌ UsageMetrics component needs complete implementation:
  - [ ] Current usage display
  - [ ] Usage history visualization
  - [ ] Limit indicators
  - [ ] Usage breakdown charts

### 4. Feature Management

#### Access Control Gaps
- 🟡 Team size limits need implementation
- ❌ Usage quotas system needed

#### Trial System Gaps
- 🟡 Trial management needs enhancement:
  - [ ] Grace period implementation
  - [ ] Trial expiration handling
  - [ ] Trial to paid conversion flow

#### Team Management Gaps
- 🟡 Seat allocation needs improvement
- ❌ Usage tracking for teams
- ❌ Limit enforcement
- ❌ Upgrade prompts

### 5. Testing Strategy

#### Integration Tests Gaps
- 🟡 Need to complete:
  - [ ] Subscription flow tests
  - [ ] Payment processing tests
  - [ ] Webhook handling tests
  - [ ] Usage tracking tests
  - [ ] Invoice generation tests

#### E2E Tests Gaps
- 🧪 Need implementation for:
  - [ ] Complete subscription flow
  - [ ] Plan upgrade/downgrade
  - [ ] Payment method management
  - [ ] Invoice access
  - [ ] Usage monitoring

### 6. Security & Compliance

#### Payment Security Gaps
- 🟡 Need to enhance:
  - [ ] PCI compliance verification
  - [ ] Secure token handling
  - [ ] Data encryption
  - [ ] Audit logging

#### Fraud Prevention Gaps
- ❌ Complete system needed:
  - [ ] Risk assessment implementation
  - [ ] Usage monitoring
  - [ ] Suspicious activity detection
  - [ ] Account verification

#### Audit System Gaps
- 🟡 Partial implementation needs completion:
  - [ ] Payment logging enhancement
  - [ ] Access tracking improvement
  - [ ] Change history implementation
  - [ ] Compliance reporting

### 7. Mobile Considerations

#### Mobile Support Gaps
- 🟡 Need to enhance:
  - [ ] Mobile-specific payment methods
  - [ ] Offline support
  - [ ] Mobile-optimized subscription flows

## Priority Recommendations

1. **High Priority**
   - Complete Stripe integration core setup
   - Implement missing billing API endpoints
   - Enhance security measures
   - Complete trial system implementation

2. **Medium Priority**
   - Implement usage tracking system
   - Enhance team management features
   - Complete frontend components
   - Implement E2E tests

3. **Lower Priority**
   - Implement advanced fraud prevention
   - Add detailed audit logging
   - Enhance mobile-specific features

## Notes
- All implementations should maintain modularity
- Features should be easy to toggle on/off
- Code should remain database-agnostic where possible
- Cross-platform compatibility must be maintained
- Security and compliance should be considered at each step

## Miscellaneous/Uncategorized Gaps

These items appear on the checklist or in previous discussions but need clearer placement within the phases or further definition:

*   **Verification UI Integration:** 
    *   ✅ Redirection to `/check-email` after registration implemented.
    *   🟡 Redirection back to app after clicking verification link handled by Supabase, BUT verification fails due to SendGrid click tracking interference.
    *   ✅ Auth state update via `onAuthStateChange` listener in `UserManagementClientBoundary` implemented.
    *   ✅ Success toast notification upon verification added to `UserManagementClientBoundary` (requires `react-hot-toast` install).
    *   ❌ Displaying user-friendly messages on `/verify-email` page for specific errors (e.g., expired link after timeout, invalid token) still needed.
    *   ➡️ **Next Action:** Disable SendGrid click tracking.

## Manual Verification Checklist Gaps (Latest Review)

The following gaps were identified during the most recent manual verification and checklist review. These are not all reflected in previous phase documents and must be addressed for a production-ready, user-friendly system. Each gap is cross-referenced with the checklist for details.

### Missing User-Facing UI (Feature Not Exposed to End Users)
- **Social Login on Login Page:** OAuth logic and UI components exist, but social login buttons are not rendered on the login form. (Checklist: Login Flow)
- **Social Registration on Registration Page:** Same as above, but for registration. (Checklist: Registration Flow)
- **Connected Accounts in Profile:** Account linking UI is now available in the profile page/editor. Integration tests for linking/unlinking are implemented. **E2E tests still missing.**
- **Role/Permission Management UI:** No UI for role/permission management in admin, settings, or profile. All RBAC logic is backend/store only. **Work on UI is starting now.**
- **User Profile Verification UI:** No UI for requesting or viewing user profile verification; only company/domain verification exists. (Checklist: Profile Verification Flow)
- **Session/Device Management UI:** No UI for viewing or revoking active sessions/devices. (Checklist: Session Management Flow)
- **Account Recovery Options UI:** No UI for adding/managing recovery email/phone. (Checklist: Account Recovery Options Flow)
- **API Key Management UI:** No UI for creating, viewing, or revoking API keys. (Checklist: API Key Management Flow)
- **Custom Attribute Management UI:** No UI for adding, editing, or removing custom attributes. (Checklist: Custom Attribute Management Flow)
- **Terms & Policy Updates/Consent UI:** No UI for re-consenting to updated terms/policy. (Checklist: Terms & Policy Updates Flow)
- **User Support/Contact/Feedback UI:** No UI for submitting support requests or feedback. (Checklist: User Support/Contact/Feedback Flow)
- **Account Reactivation UI:** No UI for reactivating a deactivated account. (Checklist: Account Reactivation Flow)
- **Team/Organization Management UI:** No UI for managing teams/orgs, inviting members, or managing roles. (Checklist: User Invitation & Team/Organization Management Flow)
- **Activity/Audit Logging UI:** No UI for viewing activity/audit logs. (Checklist: Activity/Audit Logging Flow)

### Missing Automated Tests (Unit/Integration/E2E)
- **E2E Tests for All Critical Flows:** Most user flows lack E2E test coverage. (Checklist: All Flows)
- **Integration/Unit Tests for New Features:** For each missing UI above, corresponding tests are also missing and must be added as features are implemented.

### General Notes
- For each gap, both the feature and its tests must be implemented together.
- See the manual verification checklist for detailed status, expected behavior, and test coverage notes.
- This section should be updated as gaps are closed or new ones are discovered.