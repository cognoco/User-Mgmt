# GAP_ANALYSIS.md

> **Note:** This gap analysis is maintained in sync with the canonical [Master List of All Features](./Master-List-of-all-features.md). For the most up-to-date status and details, always refer to the Master List.

## Backup Codes (Account Recovery) Feature

### Existing Implementation
- `MFAManagementSection.tsx` and `BackupCodesDisplay.tsx` for backup code management in settings
- `MFAVerificationForm.tsx` for backup code entry during login/2FA
- API endpoints for backup code generation and verification

### Gaps Previously Identified
- No integration or E2E tests for backup code flows (now implemented)
- No error handling for invalid/used codes in tests (now implemented)

### Current Status
- All major gaps addressed for backup codes:
  - Integration and E2E tests implemented
  - Documentation updated

---

## Remaining Gaps & Potential Enhancements (Project-wide)

| Area                | Potential Gap / Enhancement                | Criticality |
|---------------------|--------------------------------------------|-------------|
| Testing             | Failing/incomplete E2E & integration tests | High        |
| Company Profile     | No E2E/integration/component tests for company profile CRUD | High |
| User Preferences    | No direct tests for user settings/preferences CRUD | High |
| 2FA/MFA             | No tests for disabling 2FA, error states, admin override | High |
| Subscription        | No E2E for full payment/checkout/invoice journey | High |
| Audit Logging       | No explicit E2E/integration/component tests for audit log viewing/export | Medium |
| Session Management  | No tests for admin session revocation, session expiration, error handling | Medium |
| SSO/Account Linking | E2E skeletons exist, not implemented/verified; integration tests need expansion | Medium |
| Accessibility (a11y)| No automated/manual test coverage          | Medium      |
| Internationalization| No test coverage for i18n or language switching | Medium |
| Mobile              | No test coverage for push notifications, biometric auth, responsive UI | Medium |
| Onboarding          | No test coverage for onboarding, checklists, first-time user flows | Medium |
| Integrations        | No test coverage for webhooks, API key management | Medium |
| Legal/Compliance    | No test coverage for ToS/privacy acceptance, residency | Medium |

**Note:** Audit logging is fully implemented and documented. Accessibility (a11y) is being actively audited and improved. See [Accessibility Documentation](./Accessibility-implementation-plan.md) for ongoing work.

*For detailed status, see [Master List of All Features](./Master-List-of-all-features.md).*

---

## Not verified but likely gaps

The following features were not found in the codebase (neither implementation nor tests), and are not already listed above. These are likely missing and should be verified in future audits:

| Feature Area         | Notes |
|----------------------|-------|
| SSO/Account Linking  | Core implementation exists. E2E *skeletons* created, need implementation/verification. Integration tests need review/expansion. |
| Company Profile CRUD | No E2E/integration/component tests for company profile management. |
| User Preferences     | No direct tests for user settings/preferences CRUD. |
| 2FA/MFA Edge Cases   | No tests for disabling 2FA, error states, admin override. |
| Subscription E2E     | No E2E for full payment/checkout/invoice journey. |
| Audit Logging        | No explicit E2E/integration/component tests for audit log viewing/export. |
| Session Management   | No tests for admin session revocation, session expiration, error handling. |
| Accessibility (a11y) | No automated/manual test coverage. |
| Internationalization | No test coverage for i18n or language switching. |
| Mobile Flows         | No test coverage for push notifications, biometric auth, responsive UI. |
| Onboarding           | No test coverage for onboarding, checklists, first-time user flows. |
| Integrations         | No test coverage for webhooks, API key management. |
| Legal/Compliance     | No test coverage for ToS/privacy acceptance, residency. |

> This section should be updated as features are implemented or verified to exist. If a feature is found or added, move it to the main gap/enhancement table above or mark as resolved.
