# GAP_ANALYSIS.md

---
**Summary:**
This document is the single source of truth for all gap analysis, missing features, and open issues in the User Management System. All gaps, missing features, and enhancements are tracked here. For implementation status, see the Implementation-Checklist.md. For action plans and next steps, see IMPLEMENTATION_PLAN.md.
---

**Development & Testing Approach:**
- The project now uses a production-first, test-second approach for all new features.
- Tests are written after the production code is complete, unless a feature is high-risk or likely to cause regressions.
- This ensures that tests always reflect the real, user-facing implementation.

## Gap Analysis & Open Issues

| Area                | Potential Gap / Enhancement                | Criticality | Coverage Status |
|---------------------|--------------------------------------------|-------------|----------------|
| Mobile/PWA          | No PWA features (manifest, service worker, offline, installable, push notifications) | High | Responsive UI only; not installable, no offline support |
| Onboarding          | No test coverage for onboarding, checklists, first-time user flows | Medium | No tests found |
| Integrations        | No test coverage for webhooks, API key management | Medium | No tests found |
| Legal/Compliance    | No test coverage for ToS/privacy acceptance, residency | Medium | No tests found |
| SSO Edge Cases      | Some SSO edge cases (revoked access, missing email, provider outage) are not covered | Medium | Partially covered |

**Note:** Some features have partial test coverage (integration/component), but E2E or edge-case coverage is still missing. See `Testing_Findings.md` for detailed findings and `TESTING_ISSUES.md` for the remediation plan.

---

## Not Verified but Likely Gaps

| Feature Area         | Notes |
|----------------------|-------|
| Onboarding           | No onboarding/checklists/first-time user flows implemented or tested. |
| Integrations         | No webhooks/API key management implemented or tested. |
| Legal/Compliance     | No ToS/privacy acceptance, residency logic implemented or tested. |

---

## Manual Verification & Automated Test Coverage Gaps

The following gaps were identified during manual verification (see MANUAL_VERIFICATION_CHECKLIST.md for details). These represent areas where automated test coverage is missing or incomplete, or where manual verification revealed untested or partially tested flows.

### Registration Flow
- **No E2E test for "Get Started" button navigation**
  - E2E test needed: Navigate to `/`, click "Get Started", verify redirect/prompt.
- **No test for password requirements helper text**
  - Test needed: Verify the *exact* content and requirements listed in the helper text below the password field.
- **No E2E test for email delivery/verification**
  - E2E test needed: Use a tool like MailHog/Mailosaur to intercept and check email content/links.

### Other Flows
- **Onboarding/Setup Wizard**
  - E2E test needed: New user login, verify onboarding shown.
  - E2E test needed: Complete profile, verify step completion.
  - E2E test needed: Navigate feature tour, verify content.
  - E2E test needed: Set preferences, verify persistence.
  - E2E test needed: Complete onboarding, verify redirect.
  - E2E test needed: Skip/reset onboarding, verify state.
- **Terms & Policy Updates/Consent**
  - E2E test needed: Trigger update, verify prompt.
  - E2E test needed: Accept terms, verify consent.
  - E2E test needed: Decline terms, verify restriction.
  - E2E test needed: Simulate error, check message.
- **User Support/Contact/Feedback**
  - E2E test needed: Navigate to support/contact, verify option.
  - E2E test needed: Submit request, verify confirmation.
  - E2E test needed: View status, verify update.
  - E2E test needed: Simulate error, check message.
- **Account Reactivation**
  - E2E test needed: Navigate to reactivation, verify option.
  - E2E test needed: Submit reactivation, verify confirmation.
  - E2E test needed: Simulate error, check message.

**For full details and step-by-step manual verification, see MANUAL_VERIFICATION_CHECKLIST.md.**

---

## Skeleton Test Files: Feature & Test Coverage Audit

The following table summarizes the status of features and tests for each skeleton test file that still needs implementation:

```
| Skeleton Test File / Feature                        | Feature in Place? | Test in Place? | Notes                                                                                       |
|-----------------------------------------------------|-------------------|---------------|---------------------------------------------------------------------------------------------|
| src/tests/integration/consent.Skeleton.integration.test.tsx |   No        |      No       | Consent/ToS update feature not implemented, no real test                                    |
| src/tests/integration/approve-reject.Skeleton.integration.test.tsx | Yes |      No       | Approve/reject flows exist, but real test missing                                           |
| src/tests/integration/accept.Skeleton.integration.test.tsx |   Yes        |      No       | Accept/invite flows exist, but real test missing                                            |
| src/tests/integration/decline.Skeleton.integration.test.tsx |  Yes        |      No       | Decline/invite flows exist, but real test missing                                           |
| src/tests/integration/enable.Skeleton.integration.test.tsx |   Yes        |      No       | Enable/feature flows exist, but real test missing                                           |
| src/tests/integration/disable.Skeleton.integration.test.tsx |  Yes        |      No       | Disable/feature flows exist, but real test missing                                          |
| src/tests/integration/remove.Skeleton.integration.test.tsx |   Yes        |      No       | Remove/delete flows exist, but real test missing                                            |
| src/tests/integration/revoke.Skeleton.integration.test.tsx |   Yes        |      No       | Revoke flows exist, but real test missing                                                   |
| src/tests/integration/save.Skeleton.integration.test.tsx   |   Yes        |      No       | Save flows exist, but real test missing                                                     |
| src/tests/integration/download.Skeleton.integration.test.tsx | Yes        |      No       | Download/export flows exist, but real test missing                                          |
| src/tests/integration/setup.Skeleton.integration.test.tsx  |   Yes        |      No       | Setup/onboarding flows exist, but real test missing                                         |
| src/tests/integration/welcome.Skeleton.integration.test.tsx | Yes        |      No       | Welcome/onboarding flows exist, but real test missing                                       |
| src/tests/integration/feature.Skeleton.integration.test.tsx | Yes        |      No       | Feature toggle/flag flows exist, but real test missing                                      |
| src/tests/integration/general.Skeleton.integration.test.tsx | Yes        |      No       | General settings flows exist, but real test missing                                         |
| src/tests/integration/point.Skeleton.integration.test.tsx   | Yes        |      No       | Point/score flows exist, but real test missing                                              |
| src/tests/integration/position.Skeleton.integration.test.tsx | Yes       |      No       | Position/role flows exist, but real test missing                                            |
| src/tests/integration/industry.Skeleton.integration.test.tsx | Yes       |      No       | Industry/company flows exist, but real test missing                                         |
| src/tests/integration/select-upgrade-downgrade.Skeleton.integration.test.tsx | Yes | No | Plan selection/upgrade/downgrade flows exist, but real test missing                         |
| src/tests/integration/format.Skeleton.integration.test.tsx  | Yes        |      No       | Format/export flows exist, but real test missing                                            |
| src/tests/integration/confirmation.Skeleton.integration.test.tsx | Yes   |      No       | Confirmation/verify flows exist, but real test missing                                      |
| src/tests/integration/completion.Skeleton.integration.test.tsx | Yes     |      No       | Completion/onboarding flows exist, but real test missing                                    |
| src/tests/integration/configure.Skeleton.integration.test.tsx | Yes      |      No       | Configure/settings flows exist, but real test missing                                       |
| src/tests/integration/direct.Skeleton.integration.test.tsx   | Yes        |      No       | Direct navigation/flow exists, but real test missing                                        |
| src/tests/integration/home.Skeleton.integration.test.tsx     | Yes        |      No       | Home/dashboard flows exist, but real test missing                                           |
| src/tests/integration/add.Skeleton.integration.test.tsx      | Yes        |      No       | Add/invite flows exist, but real test missing                                               |
| src/tests/integration/misc.Skeleton.integration.test.tsx     | Yes        |      No       | Miscellaneous flows exist, but real test missing                                            |
```

**Legend:**
- Yes = Implemented/Present
- No = Missing/Not Implemented

For any row with 'No' in 'Test in Place?', prioritize writing a real test. For any row with 'No' in 'Feature in Place?', decide if/when to implement the feature.

---

**Completed Implementations:**
- **Company Profile**: Fully implemented with E2E tests for company profile CRUD, validation, and edge cases
- **User Preferences**: Implementation complete with comprehensive E2E tests
- **2FA/MFA**: Complete implementation including tests for setup, verification, disabling, error states, and admin override
- **Audit Logging**: Fully implemented with API endpoints, UI components, and tests for viewing, filtering, and exporting
- **SSO/Account Linking**: Core implementation complete with tests for login, signup, and account linking
- **Avatar/Profile Editing**: Fully implemented with E2E tests for all user profile functionality
- **Team/Organization Management**: Fully implemented with E2E tests for invitations, membership, and permissions
- **Subscription & Payment**: Fully implemented with comprehensive E2E tests for all stages of the payment/checkout/invoice journey
- **Internationalization (i18n)**: Complete implementation with E2E tests for language selection, content translation, persistence, form validation, and RTL support
- **Accessibility (a11y)**: Implementation complete with E2E tests for ARIA attributes, keyboard navigation, focus management, screen reader compatibility, and form accessibility

---

## References
- For detailed findings and actionable recommendations, see `Testing_Findings.md`