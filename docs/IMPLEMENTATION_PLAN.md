# IMPLEMENTATION_PLAN.md

> **Note:** For the most up-to-date status and details, always refer to the [Master List of All Features](./Master-List-of-all-features.md). This plan summarizes actionable next steps and priorities based on the latest gap analysis.

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
| High     | Audit Logging  | User/Admin Audit Logs                             | Implement robust audit logging for sensitive actions, with user/admin access.         | Master List: Audit Logging |
| High     | Accessibility  | a11y Audits & Fixes                               | Conduct accessibility audits and address all critical a11y issues.                    | Master List: Accessibility |
| Medium   | Account Recovery| Admin/Support Recovery Flows                      | Add flows for admin or support-driven account recovery.                               | Master List: Account Recovery |
| Medium   | Security       | Device Management, Suspicious Activity Detection  | Add device/session management and suspicious activity alerts.                         | Master List: Security |
| Medium   | Internationalization | Full i18n Coverage                          | Ensure all user-facing content is translatable and i18n-ready.                        | Master List: Internationalization |
| Medium   | Mobile         | Native Push & Biometric Auth                      | Add support for native push notifications and biometric authentication.                | Master List: Mobile |
| Medium   | Onboarding     | Guided Onboarding & Checklists                    | Implement onboarding flows and user checklists.                                       | Master List: Onboarding |
| Medium   | Integrations   | Webhooks & API Key Management                     | Add webhook support and API key management for integrations.                          | Master List: Integrations |
| Medium   | Legal/Compliance | ToS/Privacy Acceptance Tracking, Residency      | Track ToS/privacy acceptance and support data residency requirements.                  | Master List: Legal/Compliance |

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

### 2. Audit Logging: User/Admin Audit Logs

**Goal:**
All sensitive user/admin actions are logged in a secure, queryable format and accessible via a protected admin UI.

**Tasks:**
- [ ] Design audit log schema in the database (flexible for future events).
- [ ] Implement backend logging middleware for all sensitive API routes (login, password change, role updates, etc.).
- [ ] Ensure logs include timestamp, user, action, and relevant metadata.
- [ ] Create admin UI for viewing/filtering logs (with pagination, search, and export options).
- [ ] Add access control to audit log endpoints (admin-only, with proper authorization checks).
- [ ] Write integration tests for logging logic (ensure logs are created for all key actions).
- [ ] Write E2E tests for admin log viewing and filtering.
- [ ] Document audit log retention and privacy policy.

**Dependencies:**
- Database migration system in place.
- Admin role and access control implemented.

**Testing:**
- Integration and E2E tests for log creation and admin UI.

---

### 3. Accessibility: a11y Audits & Fixes

**Goal:**
The application meets accessibility standards (WCAG 2.1 AA or higher) and is usable by all users, including those using assistive technologies.

**Tasks:**
- [ ] Conduct a full accessibility audit (manual and automated, e.g., axe, Lighthouse).
- [ ] Identify and document all critical and major a11y issues.
- [ ] Fix semantic HTML issues (headings, labels, ARIA attributes, etc.).
- [ ] Ensure all interactive elements are keyboard accessible.
- [ ] Add or improve focus indicators and skip links.
- [ ] Ensure color contrast meets standards.
- [ ] Add alt text to all images and icons.
- [ ] Test with screen readers and other assistive tech.
- [ ] Add automated a11y checks to CI/CD pipeline.
- [ ] Write regression tests for a11y-critical flows.

**Dependencies:**
- Stable UI components and layouts.

**Testing:**
- Automated: axe, Lighthouse, Testing Library a11y queries.
- Manual: Keyboard navigation, screen reader testing.

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

---
