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
| Audit Logging       | ~~User/admin-accessible audit logs~~ (Completed) | High        |
| Accessibility       | a11y audits and fixes                      | High        |
| Account Recovery    | Support/admin recovery flows               | Medium      |
| Security            | Device management, suspicious activity     | Medium      |
| Internationalization| Full i18n for all user-facing content      | Medium      |
| Mobile              | Native push, biometric auth                | Medium      |
| Onboarding          | Guided onboarding, checklists              | Medium      |
| Integrations        | Webhooks, API key management               | Medium      |
| Legal/Compliance    | ToS/Privacy acceptance tracking, residency | Medium      |

**Note:** Audit logging is now fully implemented and no longer a gap.

*For detailed status, see [Master List of All Features](./Master-List-of-all-features.md).*

---

## Not verified but likely gaps

The following features were not found in the codebase (neither implementation nor tests), and are not already listed above. These are likely missing and should be verified in future audits:

| Feature Area         | Notes |
|----------------------|-------|
| SSO/Account Linking  | No implementation or tests found for SSO login, social login, OAuth, or account linking. |
| Accessibility (a11y) | No implementation or tests found; only planning documentation exists. |
| Internationalization | No implementation or tests found for i18n, language switching, or translation. |
| Mobile Flows         | No implementation or tests found for mobile-specific flows (push, biometric, responsive UI). |
| Onboarding           | No implementation or tests found for onboarding, guided checklists, or first-time user flows. |
| Integrations         | No implementation or tests found for webhooks, API key management, or integrations. |
| Legal/Compliance     | No implementation or tests found for ToS/privacy acceptance, residency, or related compliance flows. |

> This section should be updated as features are implemented or verified to exist. If a feature is found or added, move it to the main gap/enhancement table above or mark as resolved.
