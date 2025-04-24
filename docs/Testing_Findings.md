TESTING_FINDINGS.md
Summary of Current Test Failures and Issues (2024-06)
This document records the results of the latest test run, highlights key failures, and provides actionable recommendations for addressing them. It should be updated as issues are resolved or new problems are discovered.
1. UI/Component Test Failures
Data Export (Company & Personal):
Tests expect a success message after clicking "Download", but only error messages ("Failed to export...") are rendered.
Possible causes: Export logic is not mocked, or test setup does not simulate a successful export.
Action: Mock export/download logic in tests to simulate both success and failure.
Profile Verification:
Test fails due to multiple elements matching /verified/i.
Action: Use getAllByText or a more specific matcher in the test.
Remove Member Dialog:
Test cannot find the text Please type "remove" to confirm or Failed to remove member.
Possible cause: Text is split across elements or not rendered as expected.
Action: Use a function matcher or query by role/label; check if the UI renders the text as expected.
2. Store/State Management Test Failures
Auth Store Tests:
useAuthStore.getState and useAuthStore.setState are not functions.
Indicates a mismatch between the test and the actual store implementation (possibly due to a refactor or import path issue).
Action:
Investigate import paths and ensure tests use the correct, up-to-date store implementation.
Check for changes in the store API (e.g., if using Zustand, ensure the store exposes getState/setState).
3. Unhandled Rejections/Timeouts
Some tests (e.g., search-filter-flow.test.tsx, ProfileTypeConversion.test.tsx) are timing out or running out of memory.
Action:
Check for infinite loops, unmocked async calls, or very large test data.
Run problematic tests individually to isolate the cause.
4. General Recommendations
Prioritize fixing store/state management test issues, as these may affect many other tests.
After each fix, re-run only the affected test files to verify the fix before running the full suite again.
Update docs/TESTING_ISSUES.md as issues are resolved or new ones are found.
This file should be maintained alongside TESTING.md and TESTING_ISSUES.md for a complete view of the testing landscape.

# Additional Findings (2024-06)

## Registration Flow
- E2E and integration tests are implemented and robust.
- Skeleton E2E test was removed as the real test exists.

## Login Flow
- E2E and integration tests are implemented and robust.
- Skeleton E2E test was removed as the real test exists.

## Password Recovery/Reset Flow
- E2E and integration tests are implemented and robust.
- No skeletons or missing test placeholders exist for this flow.

## Profile Update Flow
- E2E and integration/component tests are implemented and robust for profile update.
- Skeleton E2E test for avatar upload/privacy toggle left in place, as those E2E flows are not yet implemented.

## MFA/2FA & Backup Codes
- E2E and integration tests are implemented and robust for backup codes and 2FA flows.
- Skeleton integration test was removed as the real test exists.

## Team Management
- E2E and integration tests are implemented and robust for all major user flows and roles.
- No skeletons or missing test placeholders exist for this flow.

## Settings & Notification Preferences
- E2E and integration tests are implemented and robust for notification preferences.
- Skeleton integration test was removed as the real test exists.
- Integration test for account/settings flows is comprehensive and implemented.
- E2E test for settings panel does not exist yet, so the skeleton remains for future implementation.

## Privacy Settings
- Integration/component tests are implemented and robust for privacy settings.
- Skeleton integration test was removed as the real test exists.

# General Observations
- For each major user flow, E2E and integration/component tests are present and robust, except where noted (e.g., some E2E skeletons left for future flows).
- Skeletons are only removed when a real test exists; otherwise, they are left in place for future implementation.
- No duplicate or unnecessary test files remain for the flows reviewed so far.

---

# Additional Findings (2024-06, continued)

## SSO Login & Account Linking
- Previously identified as having no E2E coverage.
- E2E test *skeletons* have now been created and implemented for core flows:
  - Personal OAuth Login: `e2e/sso-login-oauth.e.test.ts`
  - Personal OAuth Signup: `e2e/sso-signup-oauth.e2e.test.ts`
  - Business SAML/OIDC Admin Config: `e2e/business-sso-admin-config.e2e.test.ts`
  - Business SAML/OIDC User Login: `e2e/business-sso-user-login.e2e.test.ts`
  - Business SSO Status Display: `e2e/business-sso-status.e2e.test.ts`
- An existing E2E test covers Connected Accounts linking/unlinking: `e2e/connected-accounts.e2e.test.ts`.
- **Action Required:** These new skeletons require verification of selectors/URLs/mocks and implementation of user/org setup logic before they can be run successfully.
- Integration test coverage for API endpoints and specific linking logic still needs review/expansion.

## Subscription Management
- Integration/store test is implemented and robust for subscription logic (plan fetching, user subscription, feature gating).
- No E2E test for the full subscription/payment/checkout/invoice user journey.
- A skeleton E2E test exists for payment, so it remains for future implementation.

## Data Export (Personal & Company)
- E2E and integration/component tests are implemented and robust for both personal and company data export.
- Tests cover both success and error scenarios.
- No skipped or placeholder tests remain for these flows.

## Session Management
- E2E test is implemented for viewing and revoking sessions (user perspective).
- Covers main user flow, but does not cover edge cases (e.g., error handling, admin revoking other users' sessions, session expiration).
- Integration/component test review is next.

## Accessibility (a11y) Audits & Fixes
- No automated or manual test coverage for accessibility (a11y) audits or regression in the codebase.
- No skeletons or placeholder test files exist for these flows.
- This is a significant gap for compliance and inclusivity.

## Internationalization (i18n)
- No automated or manual test coverage for internationalization (i18n) or language switching in the codebase.
- No skeletons or placeholder test files exist for these flows.
- This is a significant gap for global usability and compliance.

## Mobile-Specific Flows (Push, Biometric, Responsive)
- No automated or manual test coverage for mobile-specific flows (push notifications, biometric auth, responsive UI) in the codebase.
- No skeletons or placeholder test files exist for these flows.
- This is a significant gap for cross-platform support and user experience.

## Onboarding & Guided Checklists
- No automated or manual test coverage for onboarding, guided checklists, or first-time user flows in the codebase.
- No skeletons or placeholder test files exist for these flows.
- This is a significant gap for user activation and experience.

## Integrations (Webhooks, API Key Management)
- No automated or manual test coverage for integrations (webhooks, API key management) in the codebase.
- No skeletons or placeholder test files exist for these flows.
- This is a significant gap for extensibility and interoperability.

## Legal/Compliance (ToS/Privacy Acceptance, Residency)
- No automated or manual test coverage for legal/compliance flows (ToS/privacy acceptance, residency) in the codebase.
- No skeletons or placeholder test files exist for these flows.
- This is a significant gap for regulatory compliance and user trust.

---

(Continue to append findings for each new flow/feature reviewed.)
