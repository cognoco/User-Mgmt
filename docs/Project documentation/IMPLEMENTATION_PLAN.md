# IMPLEMENTATION_PLAN.md

---
**Summary:**
This document is the single source of truth for all implementation planning, next steps, and action items for the User Management System. All actionable plans and priorities are tracked here. For implementation status, see the Implementation-Checklist.md. For gap analysis and missing features, see GAP_ANALYSIS.md.

**Development & Testing Approach:**
- The project now uses a production-first, test-second approach for all new features.
- Tests are written after the production code is complete, unless a feature is high-risk or likely to cause regressions.
- This ensures that tests always reflect the real, user-facing implementation.
---

## Implementation Plan & Next Steps

| Area                | Next Step / Action Item                | Priority | Status |
|---------------------|----------------------------------------|----------|--------|
| Company Profile     | Add E2E test for company profile CRUD  | High     | Pending |
| User Preferences    | Add E2E test for user settings/preferences CRUD | High | Pending |
| 2FA/MFA             | Add tests for disabling 2FA, error states, admin override | High | Pending |
| Subscription        | Add E2E for full payment/checkout/invoice journey | High | Pending |
| Audit Logging       | Add E2E test for audit log viewing/export | Medium | Pending |
| Session Management  | Add tests for admin session revocation, session expiration, error handling | Medium | Pending |
| SSO/Account Linking | Complete E2E for account linking, admin/edge cases | Medium | Pending |
| Internationalization| Add E2E/full i18n coverage             | Medium   | Pending |
| Onboarding          | Implement and test onboarding/checklists/first-time user flows | Medium | Pending |
| Integrations        | Implement and test webhooks, API key management | Medium | Pending |
| Legal/Compliance    | Implement and test ToS/privacy acceptance, residency | Medium | Pending |
| Avatar/Profile Editing | Add E2E test for avatar/profile editing | Medium | Pending |
| SSO/OAuth Coverage | Complete E2E implementation for all SSO/OAuth user and admin flows (not just skeletons) | High | Pending |
| SSO/OAuth API/Store | Add API/store-level tests for SSO/OAuth endpoints and account linking edge cases | High | Pending |
| SSO Audit Logging | Add tests for audit logging of SSO events (SSO_LOGIN, SSO_LINK) | Medium | Pending |
| SSO Edge Cases | Expand tests to cover SSO edge cases (revoked access, missing email, provider outage, etc.) | Medium | Pending |

# PWA/Mobile App Friendliness Breakdown
| Area      | Next Step / Action Item                                  | Priority | Status   |
|-----------|---------------------------------------------------------|----------|----------|
| Mobile/PWA| Add manifest.json and app icons                         | High     | Pending  |
| Mobile/PWA| Integrate service worker for offline support             | High     | Pending  |
| Mobile/PWA| Configure caching strategies (static/assets/API)         | High     | Pending  |
| Mobile/PWA| Add installability (prompt, splash, home screen)         | High     | Pending  |
| Mobile/PWA| Test authentication/session flows with service worker    | High     | Pending  |
| Mobile/PWA| (Optional) Implement push notification support           | Medium   | Pending  |
| Mobile/PWA| Test PWA features on multiple devices/browsers           | High     | Pending  |

# Accessibility (a11y) Implementation Breakdown
| Area            | Next Step / Action Item                                  | Priority | Status   |
|-----------------|---------------------------------------------------------|----------|----------|
| Accessibility   | Add automated a11y tests for Login flow                  | High     | Pending  |
| Accessibility   | Add automated a11y tests for Registration flow           | High     | Pending  |
| Accessibility   | Add automated a11y tests for Profile Update/Settings     | High     | Pending  |
| Accessibility   | Add automated a11y tests for Password Recovery/Reset     | High     | Pending  |
| Accessibility   | Add automated a11y tests for MFA/2FA Setup               | High     | Pending  |
| Accessibility   | Add automated a11y tests for Team/Organization Management| High     | Pending  |
| Accessibility   | Add automated a11y tests for Notification Preferences    | High     | Pending  |
| Accessibility   | Add automated a11y tests for Data Export                 | High     | Pending  |
| Accessibility   | Add automated a11y tests for Admin/Audit Log UI          | High     | Pending  |
| Accessibility   | Manual screen reader audit for all major flows           | High     | Pending  |
| Accessibility   | Verify ARIA roles and attributes for dialogs, alerts, navigation | High | Pending |
| Accessibility   | Verify color contrast meets WCAG 2.1 AA standards        | High     | Pending  |
| Accessibility   | Add focus indicators and skip links                      | High     | Pending  |
| Accessibility   | Document accessibility features and limitations          | Medium   | Pending  |
| Accessibility   | Provide guidance for integrators on accessibility        | Medium   | Pending  |

**Note:** This plan is updated as features are implemented and gaps are closed. See GAP_ANALYSIS.md for the current list of gaps and open issues.

---

## Manual Verification & Automated Test Coverage Gaps

The following gaps were identified during manual verification (see MANUAL_VERIFICATION_CHECKLIST.md for details). These represent areas where automated test coverage is missing or incomplete, or where manual verification revealed untested or partially tested flows.

### Registration Flow
- **No E2E test for "Get Started" button navigation**
  - E2E test needed: Navigate to `/`, click "Get Started", verify redirect/prompt.
- **No E2E test for registration form route navigation**
  - E2E test needed: Directly navigate to `/register`, verify page load and essential elements.
- **No test for password requirements helper text**
  - Test needed: Verify the *exact* content and requirements listed in the helper text below the password field.
- **No E2E test for social login buttons**
  - E2E/integration test needed: Verify button rendering and social registration flow.
- **No E2E test for email delivery/verification**
  - E2E test needed: Use a tool like MailHog/Mailosaur to intercept and check email content/links.

### Profile Flow
- **No E2E test for avatar upload, privacy toggle, or account linking**
  - E2E test needed: Simulate avatar upload, check preview and save.
  - E2E test needed: Simulate privacy toggle, check persistence.
  - E2E test needed: Add for profile account linking.

### Settings Flow
- **No E2E test for privacy toggle, notification toggle, etc.**
  - E2E test needed: Simulate privacy toggle, check persistence.
  - E2E test needed: Simulate notification toggle, check persistence.

### Audit/Activity Logging, API Key Management, Custom Attribute Management, etc.
- **No UI or tests implemented**
  - E2E test needed: Navigate to audit logs, verify visibility (after implementation).
  - E2E test needed: Simulate viewing logs, check details.
  - E2E test needed: Simulate filtering/searching logs.
  - E2E test needed: Simulate export, verify file.
  - E2E test needed: Simulate error, check message.
  - E2E test needed: Add account recovery options UI; E2E/integration test for adding/using recovery contacts.
  - E2E test needed: Add API key management UI; E2E/integration test for key creation/revocation.
  - E2E test needed: Add custom attribute management UI; E2E/integration test for attribute management.

### Other Flows
- **Onboarding/Setup Wizard**
  - E2E test needed: New user login, verify onboarding shown.
  - E2E test needed: Complete profile, verify step completion.
  - E2E test needed: Navigate feature tour, verify content.
  - E2E test needed: Set preferences, verify persistence.
  - E2E test needed: Complete onboarding, verify redirect.
  - E2E test needed: Skip/reset onboarding, verify state.
- **Business SSO Setup/Login**
  - E2E test needed: Navigate to SSO setup, verify option.
  - E2E test needed: Enable SSO, select provider.
  - E2E test needed: Enter/save IDP config, verify validation.
  - E2E test needed: Save settings, verify confirmation.
  - E2E test needed: SSO login, verify redirect and state.
  - E2E test needed: Link/unlink SSO, verify state.
  - E2E test needed: Simulate error, check message.
- **User Invitation & Team/Organization Management**
  - E2E test needed: Navigate to team/org management, verify option.
  - E2E test needed: Send invite, check email delivery.
  - E2E test needed: Accept invite, verify join.
  - E2E test needed: Manage members, verify changes.
  - E2E test needed: Simulate error, check message.
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

## References
- For gap analysis and missing features, see `GAP_ANALYSIS.md`.
- For implementation status, see `Product documentation/Implementation-Checklist.md`.
- For detailed findings and actionable recommendations, see `Testing_Findings.md`.
- For the systematic remediation plan and ongoing issues, see `TESTING_ISSUES.md`.
- For best practices and setup, see `TESTING.md`.

---

## Skeleton Test Files: Feature & Test Coverage Audit

The following table summarizes the status of features and tests for each skeleton test file listed in OBSOLETE_FILES_REPORT.md. For each, it is clearly indicated whether the feature, the test, or both are missing. If a real test exists, it is referenced in the Notes column.

```
| Skeleton Test File / Feature                        | Feature in Place? | Test in Place? | Notes                                                                                       |
|-----------------------------------------------------|-------------------|---------------|---------------------------------------------------------------------------------------------|
| e2e\registerform-.Skeleton.e2e.test.ts              |        Yes        |      Yes      | Covered by RegistrationForm.integration.test.tsx, user-auth-flow.test.tsx                   |
| e2e\profileeditor-profileform.Skeleton.e2e.test.ts  |        Yes        |      Yes      | Covered by user-auth-flow.test.tsx (profile update), ProfileEditor component tests           |
| e2e\payment.Skeleton.e2e.test.ts                    |        Yes        |      No       | Payment/subscription feature exists, E2E test missing or only skeleton present              |
| e2e\settingspanel.Skeleton.e2e.test.ts              |        Yes        |      Yes      | Covered by user-preferences-flow.test.tsx, notification-flow.test.tsx                       |
| src/tests/integration/edit.Skeleton.integration.test.tsx |     Yes        |      Yes      | Edit/update flows covered by user-auth-flow.test.tsx, user-preferences-flow.test.tsx        |
| src/tests/integration/notification.Skeleton.integration.test.tsx | Yes   |      Yes      | Notification preferences/settings covered by notification-flow.test.tsx                     |
| src/tests/integration/consent.Skeleton.integration.test.tsx |   No        |      No       | Consent/ToS update feature not implemented, no real test                                    |
| src/tests/integration/company.Skeleton.integration.test.tsx |   Yes       |      Yes      | Company profile covered by user-auth-flow.test.tsx, company-related integration tests        |
| src/tests/integration/backup.Skeleton.integration.test.tsx |   Yes        |      Yes      | Backup/restore covered by backup.integration.test.tsx                                       |
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