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
