# Master List of All Features

This document provides a comprehensive checklist of all features and user flows described in the `functionality-features-phase*.md` files. Use this as the single source of truth for implementation status, gap analysis, and production readiness review.

---

## How to Use This Document
- For each feature, mark the **Status** as one of: Not Started, In Progress, Complete, Needs Review.
- Use the **Notes** column for issues, dependencies, or questions.

---

# Phase 1: Foundational Setup & Core Personal Authentication
| Feature | Description | Status | Test Status | Notes |
|---------|-------------|--------|-------------|-------|
| Personal User Registration | Standard user registration with password requirements, T&C links, and validation. | Complete | Test Exists (Untested) | E2E: registration.spec.ts |
| Login | User login with email/password. | Complete | Test Exists (Untested) | E2E: login.e2e.test.ts |
| Password Reset | Request and complete password reset. | In Progress | No Test | UI present, backend logic needs review |
| Email Verification | Email verification after registration. | Complete | No Test | Implemented, but no direct E2E/integration test found |
| Terms & Conditions Acceptance | Mandatory T&C checkbox with clickable links. | Complete | Test Exists (Untested) | Covered in registration E2E |
| Password Helper UI | Dynamic password requirements helper that appears/disappears as described. | Complete | No Test | UI logic present, no direct test |
| Error Feedback | Clear error messages for all validation and server errors. | Complete | Test Exists (Untested) | Covered in E2E/login |

# Phase 2: Personal Profile Management
| Feature | Description | Status | Test Status | Notes |
|---------|-------------|--------|-------------|-------|
| View Personal Profile | Display user profile info, with placeholders for missing fields. | Complete | Test Exists (Untested) | E2E: profile-update.e2e.test.ts |
| Edit Personal Profile | Edit profile fields (name, bio, contact info, etc.) with validation. | Complete | Test Exists (Untested) | E2E: profile-update.e2e.test.ts |
| Avatar Upload | Upload and update profile picture. | In Progress | No Test | Placeholder in E2E, not implemented |
| Privacy Settings | Toggle profile visibility (public/private). | Complete | No Test | UI present, no direct test |
| Account Deletion | Multi-step confirmation and deletion flow. | Complete | Test Exists (Untested) | DeleteAccountDialog.test.tsx |
| Error Handling | Graceful handling of data fetch/save errors. | Complete | Test Exists (Untested) | Covered in E2E/profile |

# Phase 3: Business User Registration & Core Profile
| Feature | Description | Status | Test Status | Notes |
|---------|-------------|--------|-------------|-------|
| Business Registration | Register a business/corporate account with company details. | Complete | Test Exists (Untested) | ProfileTypeConversion.test.tsx |
| Company Profile | View and edit company profile info. | Complete | Test Exists (Untested) | CorporateProfileSection.test.tsx |
| Company Validation | Validate company details (e.g., VAT ID). | In Progress | No Test | UI and backend present, but not fully wired/tested |
| Business Domain Verification | Verify company website domain ownership. | Complete | No Test | UI and backend implemented, no direct test |
| Edge Cases Handling | Flows for duplicate emails, company name typos, etc. | In Progress | No Test | Some logic present, not directly tested |

# Phase 4: Advanced Authentication (SSO & MFA)
| Feature | Description | Status | Test Status | Notes |
|---------|-------------|--------|-------------|-------|
| SSO Login | Login with third-party providers (GitHub, Google, etc.). | Complete | Test Exists (Untested) | personal-sso.test.tsx, OrganizationSSO.test.tsx |
| Account Linking | Link SSO to existing accounts. | Complete | Test Exists (Untested) | personal-sso.test.tsx |
| Multi-Factor Authentication (MFA) | Enable/disable MFA, TOTP, backup codes. | Complete | Test Exists (Untested) | mfa/setup.test.tsx, mfa/verification.test.tsx, E2E: backup-codes.e2e.test.ts |
| Backup Codes Management | Generate, view, and use backup codes. | Complete | Test Exists (Untested) | backup.integration.test.tsx, backup-codes.e2e.test.ts |
| Error Handling | Clear feedback for SSO/MFA errors. | Complete | Test Exists (Untested) | Covered in SSO/MFA tests |

# Phase 5: Subscriptions & Licensing
| Feature | Description | Status | Test Status | Notes |
|---------|-------------|--------|-------------|-------|
| Subscription Tiers | Display and select subscription plans. | Complete | Test Exists (Untested) | subscription.store.test.ts, useSubscription.test.ts |
| Payment Integration | Secure payment flow (e.g., Stripe). | Complete | No Test | payment.Skeleton.e2e.test.ts (skeleton only) |
| Checkout Session | Initiate and manage checkout. | Complete | No Test | useSubscription.test.ts (mocked), no E2E |
| Subscription Management | View and manage current subscription. | Complete | Test Exists (Untested) | usePayment.test.ts, useSubscription.test.ts |
| Feature Gating | Restrict features by plan. | Complete | Test Exists (Untested) | subscription.store.test.ts |
| Invoice Management | View/download invoices. | Complete | No Test | Implemented, no direct test |
| Team/Seat Licensing | Manage seat count for business plans. | Complete | Test Exists (Untested) | TeamManagement.test.tsx, E2E: team-management.e2e.test.ts |

# Phase 6: Team Management & Business Admin
| Feature | Description | Status | Test Status | Notes |
|---------|-------------|--------|-------------|-------|
| Invite Team Member | Admin invites new team members. | Complete | Test Exists (Untested) | InviteMemberForm.test.tsx, E2E: team-management.e2e.test.ts |
| Accept Invitation | User accepts invite and joins team. | Complete | Test Exists (Untested) | E2E: team-management.e2e.test.ts, useTeamInvite.test.tsx |
| Team Member List | View/search/sort team members. | Complete | Test Exists (Untested) | TeamMembersList.test.tsx, E2E: team-management.e2e.test.ts |
| Assign/Update Role | Admin changes team member roles. | Complete | Test Exists (Untested) | E2E: role-management.spec.ts, admin/role-management.e2e.test.ts |
| Remove Team Member | Remove user from team. | Complete | Test Exists (Untested) | TeamManagement.test.tsx, E2E: team-management.e2e.test.ts |
| Admin Dashboard | Overview of team, seats, and activity. | Complete | Test Exists (Untested) | AdminDashboard.test.tsx, admin/dashboard/__tests__/route.test.ts |

# Phase 7: Advanced Security, Privacy & Notifications
| Feature | Description | Status | Test Status | Notes |
|---------|-------------|--------|-------------|-------|
| Organization Security Policy | Admin sets org-wide security rules. | Complete | Test Exists (Untested) | business-policies.test.tsx |
| Session Management | Manage and view active sessions. | Complete | Test Exists (Untested) | SessionManagement.test.tsx, session-management.e2e.test.ts |
| Notification Preferences | User configures notification types/channels. | Complete | Test Exists (Untested) | notification-preferences.e2e.test.ts, notification-flow.test.tsx |
| Notification Delivery | Email, push, and in-app notifications. | Complete | Test Exists (Untested) | notification-flow.test.tsx |
| Push Notification Setup | Enable/disable push notifications. | Complete | No Test | Implemented, no direct test |

# Phase 8: Data Management & Platform Support
| Feature | Description | Status | Test Status | Notes |
|---------|-------------|--------|-------------|-------|
| Personal Data Export | User downloads their data (GDPR). | Complete | Test Exists (Untested) | data-export.e2e.test.ts, DataExport.test.tsx |
| Company Data Export | Admin exports company/team data. | Complete | Test Exists (Untested) | company-data-export.e2e.test.ts, CompanyDataExport.test.tsx |
| Responsive Design | App works on all device sizes. | Complete | No Test | Implemented, only indirectly tested |
| Data Retention Policy | Policy for account/data deletion. | In Progress | No Test | Policy documented, not fully enforced in code |

---

# Identified Gaps & Potential Enhancements

The following table summarizes areas where additional features, improvements, or coverage may be needed to achieve best-in-class, enterprise-ready user management. These are not necessarily missing requirements, but are common in robust, production systems and may be important for your goals.

| Area                        | Potential Gap / Enhancement                | Criticality |
|-----------------------------|--------------------------------------------|-------------|
| Testing                     | Failing/incomplete E2E & integration tests | High        |
| Audit Logging               | User/admin-accessible audit logs           | High        |
| Account Recovery            | Support/admin recovery flows               | Medium      |
| Security                    | Device management, suspicious activity     | Medium      |
| Accessibility               | a11y audits and fixes                      | High        |
| Internationalization        | Full i18n for all user-facing content      | Medium      |
| Mobile                      | Native push, biometric auth                | Medium      |
| Onboarding                  | Guided onboarding, checklists              | Medium      |
| Integrations                | Webhooks, API key management               | Medium      |
| Legal/Compliance            | ToS/Privacy acceptance tracking, residency | Medium      |

*See the summary above for more detail on each gap or enhancement.*

---

*This list is derived from the `functionality-features-phase*.md` files and should be updated as requirements evolve or new phases are added.* 