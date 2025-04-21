# Implementation Plan - User Management System

This plan provides a step-by-step, test-driven roadmap for closing all gaps identified in the latest GAP_ANALYSIS and manual verification checklist. For each missing feature/UI, tests (unit/integration/E2E) must be implemented at the same time. The plan also includes a parallel track for building out the E2E test suite for all critical flows.

---

## Guiding Principles
- **Feature + Test Together:** Every new feature/UI must be implemented with corresponding unit, integration, and E2E tests.
- **E2E Suite in Parallel:** Build out the E2E test suite for all critical flows as features become available.
- **Prioritize by User Impact:** Address the most user-visible and high-impact gaps first.
- **Keep Code Modular & Pluggable:** All features should be easy to enable/disable and database-agnostic where possible.
- **Update Documentation:** Update the checklist, GAP_ANALYSIS, and this plan as features are completed.

---

## NEXT ACTION ITEMS: Connected Accounts in Profile

1. **UI Exposure**
   - [x] Check if the `ConnectedAccounts` component is rendered in the profile page/editor (not just in settings).
   - [x] If not present, add the `ConnectedAccounts` component to the profile page/editor in a logical, user-friendly location.
   - [x] Ensure the UI is accessible and visually consistent with the rest of the profile editor.

2. **Integration Tests**
   - [x] Check for existing integration tests that verify the presence and functionality of the Connected Accounts section in the profile editor. (Test added for presence)
   - [x] Assert the Connected Accounts UI is rendered in the profile editor. (Test added)
   - [x] Assert that linking and unlinking accounts updates the UI as expected (mocking backend as needed).

3. **E2E Tests**
   - [ ] (Optional/if feasible) Add E2E tests to simulate linking and unlinking accounts from the profile page, verifying user flow and UI updates. **(Still missing)**

4. **Review & Documentation**
   - [x] Review for references to the profile page/editor and ConnectedAccounts component to avoid duplication or missed imports.
   - [x] Update this checklist and the implementation plan as each item is completed.

---

## Implementation Sequence

### 1. Social Login & Registration UI

**Goal:** Add social login buttons (Google/Apple) to Login and Registration forms, ensure functionality and accessibility, and implement integration/E2E tests for these flows.

### Progress:
- [x] Social login UI (`OAuthButtons`) integrated into Login form.
- [x] Social login UI (`OAuthButtons`) integrated into Registration form.
- [x] Integration tests for social login button rendering in both forms.
- [x] E2E-style tests for social login button visibility in both forms.

**Next:**
- (Optional) Add E2E tests for actual OAuth flow (mocking redirects/callbacks) if feasible.
- Proceed to next feature: Connected Accounts in Profile (UI + tests).

### 2. Connected Accounts in Profile
- **Expose Connected Accounts (account linking) UI in the profile page/editor.**
  - [x] UI exposed in ProfileEditor.
- **Tests:** Integration and E2E tests for linking/unlinking accounts from profile.
  - [x] Integration test for presence of Connected Accounts section added to ProfileEditor.test.tsx.
  - [x] Integration tests for linking/unlinking accounts are implemented.
  - [ ] E2E tests for linking/unlinking accounts (optional/next step).

### 3. Role/Permission Management UI

**Goal:**  
Deliver a modular, pluggable admin-facing UI for managing user roles and viewing permissions, with robust integration and E2E test coverage.

#### Step-by-Step Plan for Role/Permission Management UI

**1. UI/UX Requirements & Design**
   - [x] Define the core use cases:  
     - List users and their roles  
     - Assign a new role to a user  
     - Remove a role from a user  
     - View all available roles and their permissions  
   - [x] Specify props and configuration for pluggability (e.g., user source, RBAC store override, feature toggles).
   - [x] Sketch a wireframe (text or Figma) for the main panel, including mobile and accessibility considerations.
   - [x] Review with stakeholders (if available) and update requirements.

**2. API & Store Integration**
   - [x] Audit the existing RBAC store and API endpoints for role/permission management.
   - [x] Document the expected data shape for users, roles, and permissions.
   - [x] Ensure all UI actions (assign/remove role) use the store/actions, not direct DB calls.
   - [x] Abstract backend-specific logic (e.g., Prisma, Supabase) behind the store for future DB swaps.

**3. UI Implementation**
   - [x] Create a new `RoleManagementPanel` component in `src/components/admin/` (or similar).
   - [x] Implement user/role listing (table or list, paginated if needed).
   - [x] Add role assignment (dropdown/select per user, triggers store action).
   - [x] Add role removal (remove button per user/role, triggers store action).
   - [ ] Add permissions viewer (expandable/collapsible or table of roles/permissions). **(Still missing)**
   - [x] Implement loading, error, and empty states.
   - [x] Ensure accessibility (keyboard navigation, ARIA labels) and responsive design.

**4. Integration Tests**
   - [x] Test rendering of the panel and user/role list. (Implemented)
   - [x] Test role assignment (mock store, assert UI and action call). (Implemented)
   - [x] Test role removal (mock store, assert UI and action call). (Implemented)
   - [x] Test permissions viewer (correct permissions shown for each role). (Implemented)
   - [x] Test loading, error, and empty states. (Implemented)

**5. E2E Tests (Optional/Recommended)**
   - [ ] Simulate admin navigating to the panel, assigning/removing roles, and verifying UI updates. **(Still missing)**
   - [ ] Test permissions visibility and error handling in a real browser context. **(Still missing)**

**6. Documentation & Review**
   - [ ] Update the implementation plan, checklist, and gap analysis as the feature and tests are completed.
   - [ ] Add usage instructions and configuration notes to the component's README or docstring.
   - [ ] Review for references, avoid duplication, and ensure feature toggling is possible.

**Status Note:**
- User/role listing, assignment, and removal UI is now implemented in the admin panel.
- Permissions viewer and integration tests are now implemented and passing.
- E2E tests are still missing.
- This section will be updated as the remaining items are completed.

### E2E Tests for Role/Permission Management UI (Admin Flow)

**Step-by-Step Plan:**
1. **E2E Test Setup**
   - [ ] Confirm E2E test framework (e.g., Playwright or Cypress) is installed and configured.
   - [ ] Ensure test user(s) and admin user(s) exist in the test environment.
   - [ ] Set up test data: at least one user with admin rights, several regular users, and a variety of roles/permissions.

2. **Test: Admin Navigates to Role Management Panel**
   - [ ] Log in as admin.
   - [ ] Navigate to the admin dashboard/role management page.
   - [ ] Assert that the RoleManagementPanel is visible and loads user/role data.

3. **Test: Assign Role to User**
   - [ ] Locate a user without a specific role.
   - [ ] Use the UI to assign a new role.
   - [ ] Assert that the UI updates and the user now has the new role.

4. **Test: Remove Role from User**
   - [ ] Locate a user with an existing role.
   - [ ] Use the UI to remove the role.
   - [ ] Assert that the UI updates and the role is removed.

5. **Test: View Permissions for Each Role**
   - [ ] Expand/collapse the permissions viewer for each role.
   - [ ] Assert that the correct permissions are displayed.

6. **Test: Loading, Error, and Empty States**
   - [ ] Simulate loading state (e.g., slow network).
   - [ ] Simulate error state (e.g., API failure).
   - [ ] Simulate empty state (no users/roles).
   - [ ] Assert that the correct UI feedback is shown for each state.

7. **Accessibility & Responsiveness**
   - [ ] Check keyboard navigation and ARIA labels.
   - [ ] Verify UI on mobile viewport.

8. **Cleanup**
   - [ ] Reset any test data/roles to original state.

### 4. User Profile Verification UI
- **Add UI for requesting and viewing user profile verification (not just company/domain).**
- **Tests:** Integration and E2E tests for verification request/status.

### 5. Session/Device Management UI
- **Implement UI for viewing and revoking active sessions/devices.**
- **Tests:** Integration and E2E tests for session listing and revocation.

### 6. Account Recovery Options UI
- **Add UI for adding/managing recovery email/phone.**
- **Tests:** Integration and E2E tests for recovery contact flows.

### 7. API Key Management UI
- **Implement UI for creating, viewing, and revoking API keys.**
- **Tests:** Integration and E2E tests for API key management.

### 8. Custom Attribute Management UI
- **Add UI for adding, editing, and removing custom attributes.**
- **Tests:** Integration and E2E tests for attribute management.

### 9. Terms & Policy Updates/Consent UI
- **Implement UI for re-consenting to updated terms/policy.**
- **Tests:** Integration and E2E tests for consent flows.

### 10. User Support/Contact/Feedback UI
- **Add UI for submitting support requests or feedback.**
- **Tests:** Integration and E2E tests for support/feedback flows.

### 11. Account Reactivation UI
- **Implement UI for reactivating a deactivated account.**
- **Tests:** Integration and E2E tests for reactivation flows.

### 12. Team/Organization Management UI
- **Add UI for managing teams/orgs, inviting members, and managing roles.**
- **Tests:** Integration and E2E tests for team/org flows.

### 13. Activity/Audit Logging UI
- **Implement UI for viewing activity/audit logs.**
- **Tests:** Integration and E2E tests for log viewing/export.

---

## Parallel Track: E2E Test Suite
- **Build out E2E tests for all critical user flows as features become available.**
- **Prioritize:** Registration, login, profile update, password recovery, MFA, subscription, payment, team/org management, and account deletion.
- **Update:** As new features are implemented, add corresponding E2E tests immediately.

---

## Next Action Sequence: E2E Test Coverage for Critical User Flows

**Guiding Principles:**
- All E2E tests should simulate real user behavior as closely as possible.
- Place E2E tests in `/src/tests/e2e/` (or `/src/tests/e2e/{feature}/` for feature grouping).
- Use only the established stack (e.g., Playwright or Cypress, as configured).
- Each E2E test should be atomic, repeatable, and clean up after itself.
- For each flow, ensure that all major edge cases and error states are covered.
- Update the implementation plan and checklist as each flow is completed.

### Step-by-Step Plan

#### 1. E2E Test Framework Setup
- [ ] Confirm which E2E framework is installed (Playwright or Cypress).
- [ ] Ensure E2E test runner is configured in `package.json` (e.g., `npm run test:e2e`).
- [ ] Add a README in `/src/tests/e2e/` with instructions for running E2E tests locally and in CI.

#### 2. Registration Flow
- [x] Create `/e2e/auth/registration.spec.ts` (Playwright E2E test file created for registration happy path)
- [x] Test: Navigate to `/register`, fill out the form with valid data, submit, and verify success message or redirect. *(Implemented in e2e/auth/registration.spec.ts)*
- [ ] Test: Attempt registration with an already registered (verified) email, verify error message.
- [ ] Test: Attempt registration with an unverified email, verify resend email flow.
- [ ] Test: Submit invalid data (invalid email, weak password, etc.), verify validation errors.
- [ ] Test: Click verification link (simulate or use test email inbox), verify account is marked as verified.
- [ ] Test: Expired/invalid verification link, verify user-friendly error message.

#### 3. Login Flow
- [ ] Create `/src/tests/e2e/auth/login.e2e.test.ts`
- [ ] Test: Navigate to `/login`, log in with valid credentials, verify redirect to dashboard.
- [ ] Test: Log in with invalid credentials, verify error message.
- [ ] Test: Log in with social provider (mock if needed), verify flow.
- [ ] Test: Log in with MFA enabled, verify MFA prompt and code entry.

#### 4. Profile Update Flow
- [ ] Create `/src/tests/e2e/profile/profile-update.e2e.test.ts`
- [ ] Test: Log in, navigate to `/profile`, update profile fields, save, and verify changes persist.
- [ ] Test: Upload avatar, verify preview and save.
- [ ] Test: Toggle privacy settings, verify persistence.

#### 5. Password Reset Flow
- [ ] Create `/src/tests/e2e/auth/password-reset.e2e.test.ts`
- [ ] Test: Navigate to `/forgot-password`, submit valid email, verify success message.
- [ ] Test: Click reset link (simulate or use test email inbox), set new password, verify login with new password.
- [ ] Test: Submit invalid email, verify error message.

#### 6. MFA Setup and Flow
- [ ] Create `/src/tests/e2e/auth/mfa.e2e.test.ts`
- [ ] Test: Log in, navigate to MFA setup, enable TOTP/SMS/email MFA, verify setup.
- [ ] Test: Log in with MFA enabled, verify code prompt and correct/incorrect code handling.
- [ ] Test: View/download backup codes, verify codes are shown and can be used.

#### 7. Subscription Management Flow
- [ ] Create `/src/tests/e2e/subscription/subscription.e2e.test.ts`
- [ ] Test: Log in, navigate to subscription page, view plans, select/upgrade/downgrade plan, verify changes.
- [ ] Test: Enter payment details (mock if needed), verify payment and confirmation.
- [ ] Test: View/download invoices, verify file download.

#### 8. Account Deletion Flow
- [ ] Create `/src/tests/e2e/profile/account-deletion.e2e.test.ts`
- [ ] Test: Log in, navigate to account deletion, confirm deletion, verify logout and account removal.
- [ ] Test: Attempt deletion with incorrect password, verify error message.

#### 9. Data Export Flow
- [ ] Create `/src/tests/e2e/profile/data-export.e2e.test.ts`
- [ ] Test: Log in, navigate to data export, select options, export data, verify file download.

#### 10. Connected Accounts (Account Linking)
- [ ] Create `/src/tests/e2e/profile/connected-accounts.e2e.test.ts`
- [ ] Test: Log in, navigate to profile, link/unlink OAuth accounts, verify UI updates.

#### 11. Role/Permission Management (Admin)
- [ ] Create `/src/tests/e2e/admin/role-management.e2e.test.ts`
- [ ] Test: Log in as admin, navigate to role management, assign/remove roles, verify changes.

#### 12. Session/Device Management
- [ ] Create `/src/tests/e2e/profile/session-management.e2e.test.ts`
- [ ] Test: Log in, navigate to session management, view active sessions, revoke session, verify removal.

#### 13. Onboarding/Setup Wizard
- [ ] Create `/src/tests/e2e/onboarding/onboarding.e2e.test.ts`
- [ ] Test: Log in as new user, complete onboarding steps, verify progress and completion.

#### 14. Other Flows (as features are implemented)
- [ ] Repeat above steps for: account recovery, API key management, custom attributes, terms/consent, support/feedback, account reactivation, team/org management, activity/audit log UI, etc.

---

**For Each E2E Test:**
- [ ] Follow `/src/tests/e2e/{feature}/` structure.
- [ ] Use absolute imports as per guidelines.
- [ ] Clean up any test data created (delete test users, etc.).
- [ ] Add comments and clear test descriptions.
- [ ] Update the implementation plan and checklist after each test is implemented and passing.

---

**Documentation & Review**
- [ ] Update `/docs/IMPLEMENTATION_PLAN.md` and `/docs/MANUAL_VERIFICATION_CHECKLIST.md` as each flow/test is completed.
- [ ] Add any new test utilities to `/src/tests/utils/` as needed, checking for existing utilities first.
- [ ] Ensure all new test files follow the naming and placement conventions in `File structure guidelines.md`.

---

## Maintenance & Updates
- **Review and update this plan, the checklist, and GAP_ANALYSIS after each feature/test is completed.**
- **Re-prioritize as needed based on user feedback, business needs, or technical dependencies.**

---

## Next Steps
1. Review and approve this plan.
2. (Optional) Add E2E tests for actual OAuth flow (mocking redirects/callbacks).
3. Proceed to Connected Accounts in Profile (feature + tests).
4. Continue down the list, always implementing tests alongside features.
5. Build out the E2E suite in parallel.

**Note:** Checklist, GAP_ANALYSIS, and manual verification checklist have been updated to reflect the current status. 