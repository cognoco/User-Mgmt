# IMPLEMENTATION_PLAN.md

> **Note:** For the most up-to-date status and details, always refer to the [Master List of All Features](./Master-List-of-all-features.md). This plan summarizes actionable next steps and priorities based on the latest gap analysis.
> 
> **Update (2024-06): Audit logging and accessibility (a11y) are now fully implemented, tested, and documented. See [Accessibility Documentation](./Accessibility-implementation-plan.md) and audit log sections below for details.**

## Backup Codes (Account Recovery) Feature

### Scope
- Generate, download, and regenerate backup codes for 2FA recovery
- Use backup codes to log in if 2FA device is lost
- Error handling for invalid/used codes

### API Endpoints
- `POST /api/2fa/backup-codes` — generate new backup codes
- `POST /api/2fa/backup-codes/verify` — verify and consume a backup code

### Frontend
- `MFAManagementSection.tsx` + `BackupCodesDisplay.tsx` for settings UI
- `MFAVerificationForm.tsx` for backup code entry during login/2FA

### Testing
- **Integration:** `src/tests/integration/backup.integration.test.tsx`
- **E2E:** `e2e/backup-codes.e2e.test.ts`
- Both cover backup code management and login flows

### Status
- Implementation complete
- Tests implemented and documented
- Next: Run tests and address any failures

---

## Next Steps: Critical Gaps & Priorities

| Priority | Area            | Action/Feature                                    | Description/Next Step                                                                 | Reference |
|----------|----------------|---------------------------------------------------|--------------------------------------------------------------------------------------|-----------|
| High     | Testing        | E2E & Integration Test Coverage                   | Review, fix, and complete all critical E2E/integration tests.                        | Master List: Testing |
| Medium   | Account Recovery| Admin/Support Recovery Flows                      | Add flows for admin or support-driven account recovery.                               | Master List: Account Recovery |
| Medium   | Security       | Device Management, Suspicious Activity Detection  | Add device/session management and suspicious activity alerts.                         | Master List: Security |
| Medium   | Internationalization | Full i18n Coverage                          | Ensure all user-facing content is translatable and i18n-ready.                        | Master List: Internationalization |
| Medium   | Mobile         | Native Push & Biometric Auth                      | Add support for native push notifications and biometric authentication.                | Master List: Mobile |
| Medium   | Onboarding     | Guided Onboarding & Checklists                    | Implement onboarding flows and user checklists.                                       | Master List: Onboarding |
| Medium   | Integrations   | Webhooks & API Key Management                     | Add webhook support and API key management for integrations.                          | Master List: Integrations |
| Medium   | Legal/Compliance | ToS/Privacy Acceptance Tracking, Residency      | Track ToS/privacy acceptance and support data residency requirements.                  | Master List: Legal/Compliance |
| Medium   | SSO/Account Linking | Review & Expand Test Coverage                   | Core flows implemented. Implement E2E skeletons & verify. Review/expand integration tests. | Master List: SSO/Account Linking |

*For detailed status and additional context, see [Master List of All Features](./Master-List-of-all-features.md).*

---

## Detailed Action Plan for High-Priority Gaps

### 1. Testing: E2E & Integration Test Coverage

**Goal:**
All critical user flows are covered by reliable E2E and integration tests; test suite is green and actionable failures are tracked.

**Tasks:**
- [x] Review all existing E2E and integration tests for coverage and accuracy.
- [x] Identify and document failing or outdated tests in `docs/TESTING_FINDINGS.md`.
- [ ] Fix import path issues and update tests to match current app structure.
- [ ] Mock network requests and side effects where needed (e.g., data export, file downloads).
- [ ] Update selectors and queries in tests to match current UI (e.g., use `getAllByText` for ambiguous matches).
- [ ] Add missing tests for new or recently refactored features.
- [ ] Run tests incrementally after each fix; verify only affected files before full suite runs.
- [ ] Update `docs/TESTING_ISSUES.md` as issues are resolved or new ones are found.
- [ ] Ensure all critical user flows (registration, login, profile update, team management, MFA, etc.) are covered.

**Dependencies:**
- Stable feature implementation for core flows.

**Testing:**
- E2E: Playwright, Integration: React Testing Library, MSW, etc.

---

### 2. SSO/Account Linking: Status (2024-06)

**Goal:**
Robust SSO and account linking, supporting multiple login methods, safe email updates, and collision handling, covered by comprehensive tests.

**Status:**
- SSO login, account linking, and provider management are implemented with robust backend logic, UI/UX polish, and toast feedback.
- Initial component/integration tests exist for `OrganizationSSO`, `BusinessSSOSetup`, and `IDPConfiguration`.
- E2E test skeletons created (`e2e/sso-*.e2e.test.ts`, `e2e/business-sso-*.e2e.test.ts`).
- Store-level and API-level tests are limited.
- Email collision and confirmation logic is in place, with TODOs for advanced DB logic.
- All flows are extensible for future providers and custom business rules.

**Next Steps:**
- [ ] Review and expand existing integration tests to cover all SSO-related UI and API edge cases (e.g., `OAuthButtons`, `ConnectedAccounts`, API endpoints, account linking logic).
- [ ] Implement E2E test skeletons: Requires user/org setup implementation & verification of selectors/URLs/mocks within the skeletons.
- [ ] Ensure audit logging is tested for `SSO_LOGIN` and `SSO_LINK` events.
- [ ] Finalize advanced DB logic for email collision/confirmation if needed.
- [ ] Continue UI/UX polish and accessibility improvements.

**Dependencies:**
- Stable User model and authentication flows

**Testing:**
- Integration: Account linking, SSO login, email collision, unlinking, API endpoints, components (`OAuthButtons`, `ConnectedAccounts`, etc.)
- E2E: Full SSO and account linking flows (personal & business), error handling, admin config

---

### Audit Logging & Accessibility: Status

**Audit logging and accessibility (a11y) are now fully implemented, tested, and documented.**
- See [Accessibility Documentation](./Accessibility-implementation-plan.md) for a11y details.
- See audit log sections above and in the Master List for audit logging details.
- No further action required unless new requirements emerge.

---

*Repeat this breakdown for each new high/medium priority gap as you begin work on it.*

---

## Test Coverage Review Status (2024-06)

All major user flows and features have been reviewed for test coverage and gaps, as documented in `docs/Testing_Findings.md`:

- [x] Registration
- [x] Login
- [x] Password Recovery/Reset
- [x] Profile Update
- [x] MFA/2FA & Backup Codes
- [x] Team Management
- [x] Settings & Notification Preferences
- [x] Privacy Settings
- [x] SSO Login & Account Linking
- [x] Subscription Management
- [x] Data Export (Personal & Company)
- [x] Session Management
- [x] Organization Security Policy
- [x] Audit Logging
- [x] Accessibility (a11y)
- [x] Internationalization (i18n)
- [x] Mobile-Specific Flows
- [x] Onboarding & Guided Checklists
- [x] Integrations (Webhooks, API Key Management)
- [x] Legal/Compliance (ToS/Privacy Acceptance, Residency)

**See `docs/Testing_Findings.md` for detailed findings and gap analysis.**

A. Audit and Update Manual Mocks
•	List all files in __mocks__ directories.
•	Compare with all modules being mocked in test files.
•	Ensure all required exports are present in each mock.
B. Audit and Update MSW Handlers
•	List all API endpoints used in test files.
•	Compare with handlers defined in MSW setup.
•	Add missing handlers for any endpoints not currently mocked.
C. Ensure Consistency
•	Make sure all tests use either MSW or manual mocks for network/API calls, not both for the same endpoint.
•	Remove or update any stale/unused mocks.


---
