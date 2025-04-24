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
| Account Recovery    | Support/admin recovery flows               | Medium      |
| Security            | Device/session management is next in the roadmap. Suspicious activity detection is not yet implemented. | Medium      |
| Internationalization| Full i18n for all user-facing content      | Medium      |
| Mobile              | Native push, biometric auth                | Medium      |
| Onboarding          | Guided onboarding, checklists              | Medium      |
| Integrations        | Webhooks, API key management               | Medium      |
| Legal/Compliance    | ToS/Privacy acceptance tracking, residency | Medium      |
| SSO/Account Linking | Core flows implemented; E2E test *skeletons* created, need implementation & verification. Integration tests need review/expansion. | Medium |

**Note:** Audit logging is fully implemented and documented. Accessibility (a11y) is being actively audited and improved. See [Accessibility Documentation](./Accessibility-implementation-plan.md) for ongoing work.

*For detailed status, see [Master List of All Features](./Master-List-of-all-features.md).*

---

## Not verified but likely gaps

The following features were not found in the codebase (neither implementation nor tests), and are not already listed above. These are likely missing and should be verified in future audits:

| Feature Area         | Notes |
|----------------------|-------|
| SSO/Account Linking  | Core implementation exists. E2E *skeletons* created, need implementation/verification. Integration tests need review/expansion. |
| Internationalization | Basic i18n and language switching are present in the UI, but coverage is incomplete and needs expansion and testing. |
| Mobile Flows         | Responsive UI is implemented and tested for core flows. Native push and biometric auth are planned but not yet implemented. |
| Onboarding           | Not yet implemented. Planned as next major feature after device/session management. |
| Integrations         | Not yet implemented. |
| Legal/Compliance     | ToS/privacy acceptance is implemented in registration. Residency and other compliance flows are not yet implemented. |

> This section should be updated as features are implemented or verified to exist. If a feature is found or added, move it to the main gap/enhancement table above or mark as resolved.
