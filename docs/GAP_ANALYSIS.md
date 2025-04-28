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

| Area                | Potential Gap / Enhancement                | Criticality | Coverage Status |
|---------------------|--------------------------------------------|-------------|----------------|
| Testing             | Failing/incomplete E2E & integration tests | High        | Some tests fail, see Testing_Findings.md |
| Company Profile     | No E2E/integration/component tests for company profile CRUD | High | No CRUD tests found |
| User Preferences    | No direct tests for user settings/preferences CRUD | High | Integration tests exist, E2E missing |
| 2FA/MFA             | No tests for disabling 2FA, error states, admin override | High | No tests found |
| Subscription        | No E2E for full payment/checkout/invoice journey | High | Store/integration tests exist, E2E missing |
| Audit Logging       | No explicit E2E/integration/component tests for audit log viewing/export | Medium | Some E2E/component tests exist, may not cover all flows |
| Session Management  | No tests for admin session revocation, session expiration, error handling | Medium | Main user flow covered, edge cases missing |
| SSO/Account Linking | E2E skeletons exist, not implemented/verified; integration tests need expansion | Medium | Partial, needs verification |
| Accessibility (a11y)| No automated/manual test coverage          | Medium      | No tests found |
| Internationalization| No test coverage for i18n or language switching | Medium | No tests found |
| Mobile              | No test coverage for push notifications, biometric auth, responsive UI | Medium | No tests found |
| Onboarding          | No test coverage for onboarding, checklists, first-time user flows | Medium | No tests found |
| Integrations        | No test coverage for webhooks, API key management | Medium | No tests found |
| Legal/Compliance    | No test coverage for ToS/privacy acceptance, residency | Medium | No tests found |
| Avatar/Profile Editing | No E2E test for avatar/profile editing | Medium | No E2E found |

**Note:** Some features have partial test coverage (integration/component), but E2E or edge-case coverage is still missing. See [`docs/Testing_Findings.md`](./Testing_Findings.md) for detailed findings and [`docs/TESTING_ISSUES.md`](./TESTING_ISSUES.md) for the remediation plan.

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
| Avatar/Profile Editing | No E2E test for avatar/profile editing. |

> This section should be updated as features are implemented or verified to exist. If a feature is found or added, move it to the main gap/enhancement table above or mark as resolved.

---

## Related Documentation

- For detailed findings and actionable recommendations, see [`docs/Testing_Findings.md`](./Testing_Findings.md).
- For the systematic remediation plan and ongoing issues, see [`docs/TESTING_ISSUES.md`](./TESTING_ISSUES.md).
- For best practices and setup, see [`docs/TESTING.md`](./TESTING.md).
