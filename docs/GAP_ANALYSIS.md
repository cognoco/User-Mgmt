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
| Database Agnosticism| Module currently tied to Supabase          | High        | Missing        |
| Core Auth           | Passwordless Authentication (Magic Links)  | High        | Missing        |
| Core Auth / Recovery| SMS for Account Recovery / 2FA             | High        | Missing        |
| Administration      | Basic Admin UI for User Management         | High        | Missing        |
| Security / Ops      | Basic Audit Logging of Key Events          | High        | Missing        |
| Developer Experience| Headless Usage / Clearer API Documentation | Medium-High | Missing / Needs Improvement |

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

---

## Comprehensive Feature List vs. Current Implementation Checklist

This section compares the detailed feature list provided against the status documented in the `README.md` implementation checklist.

### Covered Features

| Category                   | Feature Description                         | Notes based on Checklist                   |
|----------------------------|---------------------------------------------|--------------------------------------------|
| 9. Data & Privacy Tooling  | Export-my-data                              | `[x] Data export`                          |
| 12. Usability & Accessibility | Localization / i18n                         | `[x] Language/localization settings`, `[x] i18next integration` |

### Partially Covered Features

| Category                                     | Feature Description                                                | Notes based on Checklist                                   |
|----------------------------------------------|--------------------------------------------------------------------|------------------------------------------------------------|
| 1. Core Authentication Features              | Standards-based login flows (OAuth 2.1, OIDC, SAML)                | OAuth covered; OIDC/SAML missing.                          |
| 1. Core Authentication Features              | Pluggable password policies                                        | Strength covered; expiry/banned list missing.              |
| 1. Core Authentication Features              | Email, phone/SMS, social, enterprise identity                      | Email/Social covered; Phone/SMS/Enterprise missing.        |
| 1. Core Authentication Features              | Managed sessions (JWT, opaque, refresh, sliding, revocation)     | JWT, basic session management covered; advanced missing. |
| 1. Core Authentication Features              | Progressive profiling                                              | Account creation/email verification exist, profile step missing. |
| 2. Account Recovery & Self-Service           | Multi-channel recovery (email, SMS, TOTP, push)                    | Email covered; others missing.                             |
| 2. Account Recovery & Self-Service           | Change username/email/phone with verified hand-off                 | Basic editing exists; verification missing.                |
| 3. Security & Compliance Baseline            | MFA / adaptive MFA                                                 | Basic 2FA covered; adaptive MFA missing.                 |
| 3. Security & Compliance Baseline            | CSP, HSTS, PKCE, SameSite/secure cookies                           | Headers TODO; others likely implicit.                        |
| 4. Roles, Groups, & ABAC                   | Hierarchical roles, templates                                      | Basic RBAC exists; hierarchy/templates missing.            |
| 5. SSO & Federation                          | IdP/SP-initiated SSO                                               | Covered by OAuth implementation.                           |
| 5. SSO & Federation                          | Identity brokering / federation                                    | Covered by OAuth implementation.                           |
| 7. Developer Experience                      | REST + GraphQL + SDKs                                              | REST covered; GraphQL/SDKs missing.                        |
| 7. Developer Experience                      | Drop-in UI widgets + headless/SDK modes                            | UI widgets/modularity exist; headless missing.           |
| 7. Developer Experience                      | Postman collection + OpenAPI/Swagger                               | API docs exist; specific formats missing.                  |
| 8. Administration & Monitoring               | Dark-mode, white-label, custom domain                              | Dark mode covered; white-label/domain missing.           |
| 9. Data & Privacy Tooling                  | "Forget me" API                                                    | Account deletion exists; API aspect not detailed.          |
| 10. Extensibility & Custom Logic             | Custom schema                                                      | Profile model implies schema; arbitrary extension missing. |
| 10. Extensibility & Custom Logic             | Feature flags / entitlement management                             | Subscription distinction exists.                           |
| 12. Usability & Accessibility              | Mobile-friendly, responsive, deep links                            | Responsiveness covered; deep links missing.                |
| 12. Usability & Accessibility              | Error states, rate-limit UI, friendly copy                         | Basic error handling exists; UI polish missing.            |

### Missing Features

| Category                                     | Feature Description                                                 | Notes based on Checklist                      |
|----------------------------------------------|---------------------------------------------------------------------|-----------------------------------------------|
| 1. Core Authentication Features              | Passwordless options (magic links, WebAuthn/FIDO2)                  | `Missing`                                     |
| 2. Account Recovery & Self-Service           | Captcha / abuse-prevention                                          | `Missing`                                     |
| 2. Account Recovery & Self-Service           | End-user device list & session termination                          | Corresponds to `[ ] Multi-device session mgmt`|
| 3. Security & Compliance Baseline            | Risk signals                                                        | `Missing`                                     |
| 3. Security & Compliance Baseline            | Fine-grained brute-force blocking                                   | `Missing`                                     |
| 3. Security & Compliance Baseline            | SCIM 2.0                                                            | `Missing`                                     |
| 3. Security & Compliance Baseline            | Data-residency controls                                             | `Missing`                                     |
| 3. Security & Compliance Baseline            | Built-in audit trail                                                | Corresponds to `[ ] Audit logging`          |
| 4. Roles, Groups, & ABAC                   | Dynamic groups                                                      | `Missing`                                     |
| 4. Roles, Groups, & ABAC                   | Attribute-based policies (ABAC)                                     | `Missing`                                     |
| 4. Roles, Groups, & ABAC                   | Time-bound or context-bound grants                                  | `Missing`                                     |
| 4. Roles, Groups, & ABAC                   | Delegated administration                                            | `Missing`                                     |
| 5. SSO & Federation                          | IdP chaining                                                        | `Missing`                                     |
| 5. SSO & Federation                          | JIT provisioning (SCIM/custom)                                      | `Missing`                                     |
| 6. Tenant & Environment Flexibility          | Multi-tenancy / single-tenant spaces                                | `Missing`                                     |
| 6. Tenant & Environment Flexibility          | Config isolation (staging/prod)                                     | Likely Implicit/Missing                     |
| 6. Tenant & Environment Flexibility          | Automated tenant provisioning                                       | `Missing`                                     |
| 7. Developer Experience                      | Webhooks                                                            | `Missing`                                     |
| 7. Developer Experience                      | CLI                                                                 | `Missing`                                     |
| 7. Developer Experience                      | Local-first dev proxy / emulator                                  | `Missing`                                     |
| 8. Administration & Monitoring               | Responsive admin dashboard                                          | No specific admin dashboard feature listed    |
| 8. Administration & Monitoring               | Real-time log stream + integrations                                 | Audit logging TODO; integrations missing      |
| 8. Administration & Monitoring               | Health endpoint + Prometheus metrics                                | `Missing`                                     |
| 8. Administration & Monitoring               | Role-based dashboard views                                          | `Missing`                                     |
| 9. Data & Privacy Tooling                  | Consent management                                                  | `Missing`                                     |
| 9. Data & Privacy Tooling                  | Data-retention rules                                                | `Missing`                                     |
| 10. Extensibility & Custom Logic             | Serverless hooks / rules                                            | `Missing`                                     |
| 12. Usability & Accessibility              | WCAG 2.2 AA compliance                                              | Not explicitly tracked                      |
| 13. Migration & Interop                      | Bulk user import                                                    | `Missing`                                     |
| 13. Migration & Interop                      | Phased migration tools                                              | `Missing`                                     |
| 13. Migration & Interop                      | API gateways/adapters                                               | `Missing`                                     |

### Not Applicable / Out of Scope (Based on Checklist)

| Category                                     | Feature Description                                                | Notes                                         |
|----------------------------------------------|--------------------------------------------------------------------|-----------------------------------------------|
| 3. Security & Compliance Baseline            | Compliance artifacts (DPA, GDPR, SOC 2, etc.)                      | Documentation/Process                         |
| 11. Deployment & Ops                         | Deployment models (SaaS, on-prem)                                  | Deployment strategy                           |
| 11. Deployment & Ops                         | Upgrades, Key management, DR                                       | Ops/Infra concerns                            |
| 14. Commercial & Licensing Considerations    | Pricing, SLAs                                                      | Business/Product concerns                     |
