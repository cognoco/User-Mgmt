# TESTING.md

## Backup Codes Integration & E2E Tests

### Integration Test: `src/tests/integration/backup.integration.test.tsx`
- **Covers:**
  - Display, download, copy, and regenerate backup codes in user settings
  - Verifying a valid backup code in the MFA verification form
  - Error handling for invalid backup codes
- **Tools:** React Testing Library, MSW, React Query

### E2E Test: `e2e/backup-codes.e2e.test.ts`
- **Covers:**
  - User can generate, download, and regenerate backup codes in settings
  - User can use a backup code to log in when 2FA is required
  - Error handling for invalid backup codes during login
- **Tools:** Playwright

### Notes
- Tests simulate real user actions for backup code management and recovery flows.
- Integration and E2E tests ensure both UI and backend endpoints work as intended.
- If backup code flows are extended (e.g., admin/manual recovery), tests should be updated accordingly.
