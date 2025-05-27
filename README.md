# User Management System Documentation

## Overview
This document serves as the main reference for the User Management System. It provides links to relevant documentation and current implementation status.

## Core Documentation

### Essential References
- [Gap Analysis](./docs/Project%20documentation/GAP_ANALYSIS.md) - Current state and missing features
- [API Documentation](./docs/Product%20documentation/API.md) - Complete API reference
- [Technical Setup](./SETUP.md) - Setup and configuration guide
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment instructions
- [File Structure Guidelines](./File%20structure%20guidelines.md) - Project organization
- [Architecture Guidelines](../Product%20documentation/Architecture%20Guidelines.md) - Comprehensive architecture principles
- [Architecture Rules](../Product%20documentation/Architecture%20Rules.md) - Core architecture requirements
- [Authentication Roles](./auth-roles.md) - Role definitions and permissions
- [Authentication Setup](./docs/Product%20documentation/authentication-setup.md) - Supabase authentication flow and migration guide
- [Testing Guide](./docs/Testing%20documentation/TESTING.md) - Testing setup and guidelines
- [Testing Issues](./docs/Testing%20documentation/TESTING_ISSUES-UnitTests.md) - Known testing issues and workarounds
- [Implementation Checklist](./Product%20documentation/Implementation-Checklist.md) - Code-verified implementation and test status
- [Configuration Migration](./docs/Product%20documentation/CONFIGURATION_MIGRATION.md) - Centralized configuration usage

### Feature Documentation
- [Phase 1-2 Features](./functionality-features-phase1-2.md) - Core authentication and user management
- [Phase 3 Features](./functionality-features-phase3.md) - Enhanced features
- [Phase 4 Features](./functionality-features-phase4.md) - Advanced security and integration
- [Phase 5 Features](./functionality-features-phase5.md) - Enterprise features
- [Phase 6 Features](./functionality-features-phase6.md) - Future planned features
- [Phase 7 Features](./Product%20documentation/Implementation-Checklist.md#phase-7-audit-logging--activity-tracking) - Audit Logging & Activity Tracking
- [Phase 8 Features](./Product%20documentation/Implementation-Checklist.md#phase-8-deployment-documentation-monitoring--support) - Deployment, Documentation, Monitoring & Support

### Policies
- [Privacy Policy](./PRIVACY_POLICY.md) - Privacy guidelines and compliance
- [Data Retention Policy](./DATA_RETENTION_POLICY.md) - Data handling and retention rules

## Implementation Status

### Fully Implemented (Phase 1-2)
- Core Authentication
  - Email/Password Authentication
  - OAuth Integration
  - Password Reset
  - Email Verification
  - Session Management
- User Profile
  - Basic Profile Management
  - Avatar Upload
  - Profile Settings
  - Privacy Controls
- Basic Security
  - Password Hashing
  - Input Validation
  - CSRF Protection
  - Session Handling

### Partially Implemented (Phase 3-5)
- Subscription System
  - UI Components
  - Plan Structure
  - Payment Processing
  - Subscription Management
- Advanced Security
  - 2FA Framework
  - Rate Limiting
  - Audit Logging
  - Security Headers
- Team/Organization
  - Basic Organization Structure
  - Team Management
  - Role Hierarchy
  - Permission Management

### Planned Features (Phase 6+)
- Advanced Features
  - Multi-device Session Management
  - Advanced Activity Logging
  - Data Export/Import
  - Bulk Operations
- Enterprise Features
  - SSO Integration
  - Custom Authentication Providers
  - Advanced Audit Trails
  - Compliance Reports
- Integration Features
  - API Key Management
  - Webhook System
  - Integration Marketplace
  - Custom Extensions

## Architecture

> **IMPORTANT**: All development must follow the [Architecture Guidelines](../Product%20documentation/Architecture%20Guidelines.md) and [Architecture Rules](../Product%20documentation/Architecture%20Rules.md) to ensure the module remains modular and pluggable.

### Key Components
- `UserManagementProvider` - Core provider component
- Authentication Store - State management for auth
- API Layer - RESTful endpoints
- Database Layer - Supabase integration

### Integration Points
- Authentication Flow
- Profile Management
- Subscription System
- Organization Management

## Development Guidelines

### Setup
See [Technical Setup](./SETUP.md) for detailed instructions.

### Testing
See [Testing Guide](./TESTING.md) for testing procedures and guidelines.

### Deployment
See [Deployment Guide](./DEPLOYMENT.md) for production deployment instructions.

## Contributing
1. Follow [Architecture Guidelines](../Product%20documentation/Architecture%20Guidelines.md) and [Architecture Rules](../Product%20documentation/Architecture%20Rules.md)
2. Follow file structure guidelines
3. Maintain test coverage
4. Update documentation
5. Submit pull requests


# User Management

This project provides the User Management system used to manage authentication and related features. For a more detailed technical guide see [docs/Product documentation/SETUP.md](docs/Product%20documentation/SETUP.md).

IT IS MODULAR, PLUG IN INTO ANY APP system! Keep it in mind while working on any task or folder structure! 

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd User-Mgmt
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment variables**
   Copy the example file and fill in your credentials.
   ```bash
   cp .env.example .env.local
   ```
   Required variables include:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_APP_URL`

See the [technical setup guide](docs/Product%20documentation/SETUP.md) for more details.

## Scripts

- **Lint**: run ESLint to check the code style.
  ```bash
  npm run lint
  ```
- **Test**: run the test suite with Vitest.
  ```bash
  npm test

 ── .backend-port
├── .cursor
    └── rules
    │   ├── cursor_rules.mdc
    │   ├── dev_workflow.mdc
    │   ├── self_improve.mdc
    │   └── taskmaster.mdc
├── .cursorrules
├── .env.example
├── .env.production
├── .eslintignore
├── .eslintrc.json
├── .gitignore
├── .roo
    ├── rules-architect
    │   └── architect-rules
    ├── rules-ask
    │   └── ask-rules
    ├── rules-boomerang
    │   └── boomerang-rules
    ├── rules-code
    │   └── code-rules
    ├── rules-debug
    │   └── debug-rules
    ├── rules-test
    │   └── test-rules
    └── rules
    │   ├── dev_workflow.md
    │   ├── roo_rules.md
    │   ├── self_improve.md
    │   └── taskmaster.md
├── .roomodes
├── .taskmasterconfig
├── .windsurfrules
├── OrganizationSSO.test.tsx.bak
├── README.md
├── anonymize_user_function.sql
├── app
    ├── admin
    │   ├── audit-logs
    │   │   └── page.tsx
    │   ├── dashboard
    │   │   └── page.tsx
    │   ├── layout.tsx
    │   ├── organizations
    │   │   └── [orgId]
    │   │   │   └── settings
    │   │   │       ├── layout.tsx
    │   │   │       ├── page.tsx
    │   │   │       └── sso
    │   │   │           └── page.tsx
    │   ├── permissions
    │   │   └── page.tsx
    │   └── roles
    │   │   └── page.tsx
    ├── api
    │   ├── 2fa
    │   │   ├── backup-codes
    │   │   │   ├── route.ts
    │   │   │   └── verify
    │   │   │   │   └── route.ts
    │   │   ├── disable
    │   │   │   └── route.ts
    │   │   ├── resend-email
    │   │   │   └── route.ts
    │   │   ├── setup
    │   │   │   └── route.ts
    │   │   └── verify
    │   │   │   └── route.ts
    │   ├── address
    │   │   └── validate
    │   │   │   └── route.ts
    │   ├── admin
    │   │   ├── dashboard
    │   │   │   ├── __tests__
    │   │   │   │   └── route.test.ts
    │   │   │   └── route.ts
    │   │   ├── export
    │   │   │   └── route.ts
    │   │   └── users
    │   │   │   ├── __tests__
    │   │   │       └── route.test.js
    │   │   │   └── route.ts
    │   ├── api-keys
    │   │   ├── [keyId]
    │   │   │   ├── __tests__
    │   │   │   │   └── route.test.ts
    │   │   │   └── route.ts
    │   │   ├── __tests__
    │   │   │   └── route.test.ts
    │   │   └── route.ts
    │   ├── audit
    │   │   └── user-actions
    │   │   │   └── route.ts
    │   ├── auth
    │   │   ├── account
    │   │   │   └── route.ts
    │   │   ├── csrf
    │   │   │   └── route.ts
    │   │   ├── login
    │   │   │   ├── mfa-check
    │   │   │   │   └── route.ts
    │   │   │   └── route.ts
    │   │   ├── logout
    │   │   │   └── route.ts
    │   │   ├── mfa
    │   │   │   ├── resend-email
    │   │   │   │   └── route.ts
    │   │   │   ├── resend-sms
    │   │   │   │   └── route.ts
    │   │   │   └── verify
    │   │   │   │   └── route.ts
    │   │   ├── oauth
    │   │   │   ├── __tests__
    │   │   │   │   └── route.test.ts
    │   │   │   ├── callback
    │   │   │   │   ├── __tests__
    │   │   │   │   │   └── route.test.ts
    │   │   │   │   └── route.ts
    │   │   │   ├── disconnect
    │   │   │   │   ├── __tests__
    │   │   │   │   │   └── route.test.ts
    │   │   │   │   └── route.ts
    │   │   │   ├── link
    │   │   │   │   ├── __tests__
    │   │   │   │   │   └── route.test.ts
    │   │   │   │   └── route.ts
    │   │   │   └── route.ts
    │   │   ├── register
    │   │   │   ├── __tests__
    │   │   │   │   └── route.test.js
    │   │   │   └── route.ts
    │   │   ├── reset-password
    │   │   │   └── route.ts
    │   │   ├── send-verification-email
    │   │   │   ├── __tests__
    │   │   │   │   └── route.test.ts
    │   │   │   └── route.ts
    │   │   └── update-password
    │   │   │   └── route.ts
    │   ├── company
    │   │   ├── addresses
    │   │   │   ├── [addressId]
    │   │   │   │   └── route.ts
    │   │   │   ├── __tests__
    │   │   │   │   └── route.test.ts
    │   │   │   └── route.ts
    │   │   ├── documents
    │   │   │   ├── [documentId]
    │   │   │   │   └── route.ts
    │   │   │   └── route.ts
    │   │   ├── domains
    │   │   │   ├── [id]
    │   │   │   │   ├── route.ts
    │   │   │   │   ├── verify-check
    │   │   │   │   │   └── __tests__
    │   │   │   │   │   │   └── route.test.ts
    │   │   │   │   └── verify-initiate
    │   │   │   │   │   └── __tests__
    │   │   │   │   │       └── route.test.ts
    │   │   │   ├── __tests__
    │   │   │   │   └── route.test.ts
    │   │   │   └── route.ts
    │   │   ├── migrations
    │   │   │   ├── 001_enhance_company_schema.sql
    │   │   │   └── 002_notifications_tables.sql
    │   │   ├── notifications
    │   │   │   ├── preferences
    │   │   │   │   ├── [id]
    │   │   │   │   │   └── route.ts
    │   │   │   │   └── route.ts
    │   │   │   └── recipients
    │   │   │   │   ├── [id]
    │   │   │   │       └── route.ts
    │   │   │   │   └── route.ts
    │   │   ├── profile
    │   │   │   ├── __tests__
    │   │   │   │   └── route.test.ts
    │   │   │   └── route.ts
    │   │   ├── validate
    │   │   │   ├── __tests__
    │   │   │   │   └── route.test.ts
    │   │   │   ├── registration
    │   │   │   │   └── route.ts
    │   │   │   ├── route.ts
    │   │   │   └── tax
    │   │   │   │   └── route.ts
    │   │   └── verify-domain
    │   │   │   ├── check
    │   │   │       └── route.ts
    │   │   │   └── initiate
    │   │   │       └── route.ts
    │   ├── connected-accounts
    │   │   └── route.ts
    │   ├── csrf
    │   │   └── route.ts
    │   ├── gdpr
    │   │   ├── delete
    │   │   │   └── route.ts
    │   │   └── export
    │   │   │   └── route.ts
    │   ├── notifications
    │   │   └── route.ts
    │   ├── organizations
    │   │   └── [orgId]
    │   │   │   └── sso
    │   │   │       ├── [idpType]
    │   │   │           └── config
    │   │   │           │   ├── __tests__
    │   │   │           │       └── route.test.ts
    │   │   │           │   └── route.ts
    │   │   │       ├── __tests__
    │   │   │           └── route.test.ts
    │   │   │       ├── domains
    │   │   │           ├── __tests__
    │   │   │           │   └── route.test.ts
    │   │   │           └── route.ts
    │   │   │       ├── route.ts
    │   │   │       └── status
    │   │   │           └── route.ts
    │   ├── permissions
    │   │   └── check
    │   │   │   └── route.ts
    │   ├── preferences
    │   │   └── route.ts
    │   ├── profile
    │   │   ├── avatar
    │   │   │   └── route.ts
    │   │   ├── business
    │   │   │   ├── __tests__
    │   │   │   │   └── route.test.ts
    │   │   │   └── route.ts
    │   │   ├── export
    │   │   │   ├── download
    │   │   │   │   └── route.ts
    │   │   │   └── route.ts
    │   │   ├── logo
    │   │   │   └── route.ts
    │   │   ├── notifications
    │   │   │   └── route.ts
    │   │   ├── privacy
    │   │   │   └── route.ts
    │   │   └── verify
    │   │   │   └── route.ts
    │   ├── protected
    │   │   └── user-profile
    │   │   │   └── route.ts
    │   ├── retention
    │   │   ├── check
    │   │   │   └── route.ts
    │   │   └── reactivate
    │   │   │   └── route.ts
    │   ├── route.ts
    │   ├── session
    │   │   ├── [sessionId]
    │   │   │   └── route.ts
    │   │   ├── enforce-policies
    │   │   │   └── route.ts
    │   │   └── route.ts
    │   ├── settings
    │   │   └── route.ts
    │   ├── sso
    │   │   ├── __tests__
    │   │   │   └── route.test.ts
    │   │   └── route.ts
    │   ├── subscription
    │   │   ├── __tests__
    │   │   │   └── route.test.ts
    │   │   └── route.ts
    │   ├── tax-id
    │   │   └── validate
    │   │   │   ├── __tests__
    │   │   │       └── route.test.ts
    │   │   │   └── route.ts
    │   ├── team
    │   │   ├── invites
    │   │   │   ├── __tests__
    │   │   │   │   └── route.test.ts
    │   │   │   ├── accept
    │   │   │   │   ├── __tests__
    │   │   │   │   │   └── route.test.ts
    │   │   │   │   └── route.ts
    │   │   │   └── route.ts
    │   │   └── members
    │   │   │   ├── [memberId]
    │   │   │       ├── __tests__
    │   │   │       │   └── route.test.ts
    │   │   │       ├── role
    │   │   │       │   ├── __tests__
    │   │   │       │   │   └── route.test.ts
    │   │   │       │   └── route.ts
    │   │   │       └── route.ts
    │   │   │   ├── __tests__
    │   │   │       └── route.test.ts
    │   │   │   └── route.ts
    │   ├── upgrade-to-business.test.ts
    │   └── webhooks
    │   │   ├── [webhookId]
    │   │       ├── __tests__
    │   │       │   └── route.test.ts
    │   │       ├── deliveries
    │   │       │   ├── __tests__
    │   │       │   │   └── route.test.ts
    │   │       │   └── route.ts
    │   │       └── route.ts
    │   │   ├── __tests__
    │   │       └── route.test.ts
    │   │   ├── route.ts
    │   │   └── sso
    │   │       └── route.ts
    ├── auth
    │   └── callback
    │   │   └── page.tsx
    ├── check-email
    │   └── page.tsx
    ├── company
    │   ├── addresses
    │   │   └── page.tsx
    │   └── profile
    │   │   └── page.tsx
    ├── complete-profile
    │   └── page.tsx
    ├── dashboard
    │   └── page.tsx
    ├── globals.css
    ├── layout.tsx
    ├── login
    │   └── page.tsx
    ├── page.tsx
    ├── profile
    │   └── page.tsx
    ├── register
    │   └── page.tsx
    ├── reset-password
    │   └── page.tsx
    ├── responsive-demo
    │   └── page.tsx
    ├── settings
    │   ├── account
    │   │   └── DeleteAccountDialog.tsx
    │   ├── page.tsx
    │   └── security
    │   │   └── page.tsx
    ├── teams
    │   ├── invitations
    │   │   └── page.tsx
    │   ├── manage
    │   │   └── page.tsx
    │   └── page.tsx
    ├── update-password
    │   └── page.tsx
    └── verify-email
    │   └── page.tsx
├── components.json
├── count-latest-errors.js
├── cspell.json
├── docs
    ├── Data Retention Policy.md
    ├── LICENSE
    ├── Product documentation
    │   ├── API.md
    │   ├── Architecture Guidelines.md
    │   ├── Architecture Rules References.md
    │   ├── Architecture Rules.md
    │   ├── Clean Structure Proposal.md
    │   ├── DATA_RETENTION_POLICY.md
    │   ├── DEPLOYMENT.md
    │   ├── File structure guidelines.md
    │   ├── Ideal Structure.md
    │   ├── Implementation-Checklist.md
    │   ├── Master-List-of-all-features.md
    │   ├── PRD.md
    │   ├── PRIVACY_POLICY.md
    │   ├── SETUP.md
    │   ├── Simple Pluggable Structure.md
    │   ├── auth-roles.md
    │   ├── functionality-features-phase1-2.md
    │   ├── functionality-features-phase3.md
    │   ├── functionality-features-phase4.md
    │   ├── functionality-features-phase5.md
    │   ├── functionality-features-phase6.md
    │   ├── functionality-features-phase7.md
    │   └── functionality-features-phase8.md
    ├── Project documentation
    │   ├── Flow_VERIFICATION_CHECKLIST.md
    │   ├── For dummies.md
    │   ├── GAP_ANALYSIS.md
    │   ├── IMPLEMENTATION_PLAN.md
    │   ├── Implementation plan phase 8.md
    │   ├── Skeleton_tests that need to be redone.md
    │   ├── USER_TODO.md
    │   ├── moving test.md
    │   ├── new import paths.md
    │   ├── next to do.md
    │   ├── react19-compatibility.md
    │   └── react19-nextjs15-upgrade.md
    ├── Responsive Design Guide.md
    ├── TestResultLatest.md
    ├── TestResultsPrevious.md
    ├── Testing documentation
    │   ├── E2EAUTH_FIXPLAN.md
    │   ├── MockComponent.example.test.tsx
    │   ├── TESTING ISSUES-E2E.md
    │   ├── TESTING.md
    │   ├── TESTING_ISSUES-UnitTests.md
    │   └── testing analysis.md
    └── e2e-failure-tracking.md
├── e2e
    ├── accessibility
    │   └── a11y-features.e2e.test.ts
    ├── activity-log.e2e.test.ts
    ├── admin
    │   ├── admin-session-management.e2e.test.ts
    │   ├── audit-log.e2e.test.ts
    │   ├── business-sso-admin-config.e2e.test.ts
    │   ├── business-sso-status.e2e.test.ts
    │   ├── dashboard.spec.ts
    │   ├── login-debug.e2e.test.ts
    │   ├── role-management.e2e.test.ts
    │   └── security-policy.e2e.test.ts
    ├── auth
    │   ├── mfa
    │   │   ├── backup-codes.e2e.test.ts
    │   │   ├── mfa-email.spec.ts
    │   │   ├── mfa-management.e2e.test.ts
    │   │   ├── sms-mfa.e2e.test.ts
    │   │   ├── totp-setup.e2e.test.ts
    │   │   └── totp-verification.e2e.test.ts
    │   ├── personal
    │   │   ├── account-deletion.test.ts
    │   │   ├── check-delete-button.test.ts
    │   │   ├── debug-settings.test.ts
    │   │   ├── email-verification.test.ts
    │   │   ├── login.e2e.test.ts
    │   │   ├── logout.e2e.test.ts
    │   │   ├── password-recovery.e2e.test.ts
    │   │   ├── registration.spec.ts
    │   │   └── session-management.e2e.test.ts
    │   └── sso
    │   │   ├── business-sso-user-login.e2e.test.ts
    │   │   ├── personal-sso-login.spec.ts
    │   │   ├── sso-login-oauth.e2e.test.ts
    │   │   └── sso-signup-oauth.e2e.test.ts
    ├── company-data-export.e2e.test.ts
    ├── connected-accounts.e2e.test.ts
    ├── data-export.e2e.test.ts
    ├── data-retention.e2e.test.ts
    ├── debug
    │   └── check-ui-elements.test.ts
    ├── domain-verification
    │   └── domain-verification.spec.ts
    ├── edge-cases
    │   └── incomplete-profile-handling.spec.ts
    ├── fixtures
    │   ├── Avatar.png
    │   ├── invalid-file.txt
    │   └── test-avatar.png
    ├── i18n
    │   └── internationalization.e2e.test.ts
    ├── onboarding
    │   └── onboarding-flow.e2e.test.ts
    ├── profile
    │   ├── business-profile.e2e.test.ts
    │   ├── company-validation.e2e.test.ts
    │   ├── notification-settings
    │   │   ├── notification-delivery.e2e.test.ts
    │   │   ├── notification-preferences.e2e.test.ts
    │   │   └── push-notification.e2e.test.ts
    │   ├── update.e2e.test.ts
    │   ├── user-journey.e2e.test.ts
    │   └── verification.e2e.test.ts
    ├── role-management.spec.ts
    ├── smoke.spec.ts
    ├── subscription-and-licensing
    │   ├── License
    │   │   ├── license-management.test.ts
    │   │   ├── license.test.ts
    │   │   └── team-seat-licensing.test.ts
    │   ├── Payment
    │   │   ├── payment.test.ts
    │   │   └── paymentmethods.test.ts
    │   ├── Subscription
    │   │   ├── feature-gating.test.ts
    │   │   ├── subsription.test.ts
    │   │   └── subsriptionflow.test.ts
    │   └── payment-checkout-flow.e2e.test.ts
    ├── team-invite-flow.e2e.test.ts
    ├── team-management.e2e.test.ts
    └── utils
    │   ├── auth-utils.ts
    │   ├── auth.ts
    │   ├── global-setup.ts
    │   ├── i18n-setup.ts
    │   └── user-setup.ts
├── eslint-report.json
├── generated
    └── prisma
    │   ├── client.d.ts
    │   ├── client.js
    │   ├── default.d.ts
    │   ├── default.js
    │   ├── edge-esm.js
    │   ├── edge.d.ts
    │   ├── edge.js
    │   ├── index-browser.d.ts
    │   ├── index-browser.js
    │   ├── index.d.ts
    │   ├── index.js
    │   ├── library.d.ts
    │   ├── library.js
    │   ├── package.json
    │   ├── query_engine-windows.dll.node
    │   ├── react-native.js
    │   ├── runtime
    │       ├── edge-esm.js
    │       ├── edge.js
    │       ├── index-browser.d.ts
    │       ├── index-browser.js
    │       ├── library.d.ts
    │       ├── library.js
    │       ├── react-native.js
    │       └── wasm.js
    │   ├── schema.prisma
    │   ├── wasm.d.ts
    │   └── wasm.js
├── i18next-test-result.json
├── migrate-to-vitest.js
├── next-env.d.ts
├── next.config.mjs
├── next.config.mjs.bak
├── package-lock.json
├── package-lock.json.bak
├── package.json
├── package.json.bak
├── playwright-report
    ├── data
    │   └── ad5a0c51a7e14eeee8c015096cf3d25bcab42c77.png
    └── index.html
├── playwright.config.ts
├── postcss.config.js
├── prisma
    └── schema.prisma
├── public
    ├── assets
    │   └── avatars
    │   │   └── placeholder.txt
    └── sw.js
├── scripts
    ├── check-gaps.js
    ├── cleanup-docs.js
    ├── copy-api-routes-2.ps1
    ├── copy-api-routes-3.ps1
    ├── copy-api-routes.ps1
    ├── copy-auth-components.cjs
    ├── create-headless-auth-components.cjs
    ├── e2e_report.ps1
    ├── example_prd.txt
    ├── find-failing-tests.ps1
    ├── find-i18nerrors.ps1
    ├── fix-useauth-imports.cjs
    ├── generate-test-skeletons.js
    ├── get-backend-port.js
    ├── kill-node.js
    ├── map-sso-functionality.mjs
    ├── migrate-audit-components.cjs
    ├── migrate-auth-components.cjs
    ├── migrate-auth-imports-enhanced.cjs
    ├── migrate-auth-imports.cjs
    ├── migrate-auth-imports.js
    ├── migrate-components.cjs
    ├── migrate-imports.js
    ├── prd.txt
    ├── report-obsolete-files.js
    ├── run-tests.js
    ├── runtest.js
    ├── save-last-playwright-output.ps1
    ├── test-migrate-audit.cjs
    └── update-test-results.js
├── src
    ├── adapters
    │   ├── __tests__
    │   │   └── mocks
    │   │   │   └── supabase.ts
    │   ├── auth
    │   │   ├── factory.ts
    │   │   ├── index.ts
    │   │   ├── interfaces.ts
    │   │   ├── middleware.ts
    │   │   └── supabase-auth-provider.ts
    │   ├── index.ts
    │   ├── permission
    │   │   ├── factory.ts
    │   │   ├── index.ts
    │   │   ├── interfaces.ts
    │   │   └── supabase-permission-provider.ts
    │   ├── team
    │   │   ├── factory.ts
    │   │   ├── index.ts
    │   │   ├── interfaces.ts
    │   │   └── supabase-team-provider.ts
    │   └── user
    │   │   ├── factory.ts
    │   │   ├── index.ts
    │   │   ├── interfaces.ts
    │   │   └── supabase-user-provider.ts
    ├── components
    │   ├── account
    │   │   ├── AccountDeletion.tsx
    │   │   ├── AccountSwitcher.tsx
    │   │   ├── DeleteAccountDialog.tsx
    │   │   └── __tests__
    │   │   │   └── DeleteAccountDialog.test.tsx
    │   ├── admin
    │   │   ├── AdminDashboard.tsx
    │   │   ├── AdminUsers.tsx
    │   │   ├── RetentionDashboard.tsx
    │   │   ├── RoleManagementPanel.tsx
    │   │   ├── __tests__
    │   │   │   ├── AdminDashboard.test.tsx
    │   │   │   └── RoleManagementPanel.test.tsx
    │   │   └── audit-logs
    │   │   │   └── AdminAuditLogs.tsx
    │   ├── audit
    │   │   └── __tests__
    │   │   │   └── AuditLogViewer.test.tsx
    │   ├── auth
    │   │   ├── AccountLockout.tsx
    │   │   ├── Auth.js
    │   │   ├── BackupCodesDisplay.tsx
    │   │   ├── BusinessSSOAuth.tsx
    │   │   ├── BusinessSSOSetup.tsx
    │   │   ├── ChangePasswordForm.tsx
    │   │   ├── DomainBasedOrgMatching.tsx
    │   │   ├── EmailVerification.tsx
    │   │   ├── ForgotPasswordForm.tsx
    │   │   ├── IDPConfiguration.tsx
    │   │   ├── LoginForm.tsx
    │   │   ├── LoginFormReact19.tsx
    │   │   ├── MFAManagementSection.tsx
    │   │   ├── MFAVerificationForm.tsx
    │   │   ├── OAuthButtons.tsx
    │   │   ├── OAuthCallback.tsx
    │   │   ├── OrganizationSSO.tsx
    │   │   ├── PasswordRequirements.tsx
    │   │   ├── PasswordlessLogin.tsx
    │   │   ├── ProtectedRoute.tsx
    │   │   ├── ProviderManagementPanel.tsx
    │   │   ├── RegistrationForm.tsx
    │   │   ├── RememberMeToggle.tsx
    │   │   ├── ResetPasswordForm.tsx
    │   │   ├── SocialLoginCallbacks.tsx
    │   │   ├── TwoFactorSetup.tsx
    │   │   ├── __mocks__
    │   │   │   └── LoginForm.tsx
    │   │   ├── __tests__
    │   │   │   ├── BusinessSSOSetup.test.tsx
    │   │   │   ├── DomainBasedOrgMatching.test.tsx
    │   │   │   ├── IDPConfiguration.test.tsx
    │   │   │   ├── LoginForm.test.tsx
    │   │   │   ├── MFAManagementSection.test.tsx
    │   │   │   ├── MinimalTextareaForm.test.tsx
    │   │   │   ├── OrganizationSSO.test.tsx
    │   │   │   ├── ProtectedRoute.test.tsx
    │   │   │   ├── RegistrationForm.integration.test.tsx
    │   │   │   └── UpgradeToBusinessFlow.test.tsx
    │   │   └── withRole.tsx
    │   ├── common
    │   │   ├── DataTable.tsx
    │   │   ├── ErrorBoundary.tsx
    │   │   ├── FeedbackForm.tsx
    │   │   ├── FileManager.tsx
    │   │   ├── FormWithRecovery.tsx
    │   │   ├── NotificationCenter.tsx
    │   │   ├── PaletteThemeSwitcher.tsx
    │   │   ├── RateLimitFeedback.tsx
    │   │   ├── ReportingDashboard.tsx
    │   │   ├── ResponsiveExample.tsx
    │   │   ├── SearchResults.tsx
    │   │   ├── ThemeSettings.tsx
    │   │   ├── ThemeSwitcher.tsx
    │   │   └── UserPreferences.tsx
    │   ├── dashboard
    │   │   └── Dashboard.tsx
    │   ├── forms
    │   │   └── __tests__
    │   │   │   └── BusinessFormErrorHandling.test.tsx
    │   ├── gdpr
    │   │   ├── AccountDeletion.tsx
    │   │   ├── ConsentManagement.tsx
    │   │   └── DataExport.tsx
    │   ├── layout
    │   │   ├── Features.tsx
    │   │   ├── Footer.tsx
    │   │   ├── Header.tsx
    │   │   ├── Hero.tsx
    │   │   ├── Layout.tsx
    │   │   └── UserLayout.tsx
    │   ├── onboarding
    │   │   ├── FeatureTour.tsx
    │   │   ├── ProgressTracker.tsx
    │   │   ├── SetupWizard.tsx
    │   │   └── WelcomeScreen.tsx
    │   ├── payment
    │   │   ├── InvoiceGenerator.tsx
    │   │   ├── PaymentForm.tsx
    │   │   ├── PaymentHistory.tsx
    │   │   ├── PaymentMethodList.tsx
    │   │   └── SubscriptionManager.tsx
    │   ├── profile
    │   │   ├── ActivityLog.tsx
    │   │   ├── AvatarUpload.tsx
    │   │   ├── CompanyDataExport.tsx
    │   │   ├── CompanyLogoUpload.tsx
    │   │   ├── CorporateProfileSection.tsx
    │   │   ├── DataExport.tsx
    │   │   ├── NotificationPreferences.tsx
    │   │   ├── PrivacySettings.tsx
    │   │   ├── Profile.jsx
    │   │   ├── ProfileEditor.tsx
    │   │   ├── ProfileForm.tsx
    │   │   ├── ProfileTypeConversion.tsx
    │   │   ├── ProfileVerification.tsx
    │   │   ├── SecuritySettings.tsx
    │   │   ├── SessionManagement.tsx
    │   │   └── __tests__
    │   │   │   ├── ActivityLog.test.tsx
    │   │   │   ├── AvatarUpload.test.tsx
    │   │   │   ├── CompanyDataExport.test.tsx
    │   │   │   ├── CompanyLogoUpload.test.tsx
    │   │   │   ├── CorporateProfileSection.test.tsx
    │   │   │   ├── DataExport.test.tsx
    │   │   │   ├── NotificationPreferences.test.tsx
    │   │   │   ├── PrivacySettings.test.tsx
    │   │   │   ├── Profile.test.tsx
    │   │   │   ├── ProfileEditor.test.tsx
    │   │   │   ├── ProfilePrivacySettings.test.tsx
    │   │   │   ├── ProfileTypeConversion.test.tsx
    │   │   │   ├── ProfileVerification.test.tsx
    │   │   │   └── SessionManagement.test.tsx
    │   ├── registration
    │   │   ├── MultiStepRegistration.tsx
    │   │   └── ProfileCompletion.tsx
    │   ├── search
    │   │   └── SearchPage.tsx
    │   ├── session
    │   │   ├── SessionPolicyEnforcer.tsx
    │   │   └── SessionTimeout.tsx
    │   ├── settings
    │   │   ├── AccountDeletion.tsx
    │   │   ├── DataExport.tsx
    │   │   ├── DataImport.tsx
    │   │   ├── LanguageSelector.tsx
    │   │   └── SettingsPanel.tsx
    │   ├── shared
    │   │   ├── ConnectedAccounts.tsx
    │   │   └── NotificationPreferences.tsx
    │   ├── sharing
    │   │   └── SocialSharingComponent.tsx
    │   ├── subscription
    │   │   ├── SubscriptionBadge.tsx
    │   │   ├── SubscriptionPlans.tsx
    │   │   └── withSubscription.tsx
    │   ├── team
    │   │   ├── InviteMemberForm.tsx
    │   │   ├── InviteMemberModal.tsx
    │   │   ├── RemoveMemberDialog.tsx
    │   │   ├── TeamInviteDialog.tsx
    │   │   ├── TeamManagement.tsx
    │   │   ├── TeamMembersList.tsx
    │   │   └── __tests__
    │   │   │   ├── InviteMemberForm.test.tsx
    │   │   │   ├── RemoveMemberDialog.test.tsx
    │   │   │   ├── TeamManagement.test.tsx
    │   │   │   └── TeamMembersList.test.tsx
    │   ├── theme
    │   │   └── theme-provider.tsx
    │   └── ui
    │   │   ├── FileTypeIcon.tsx
    │   │   ├── PaletteProvider.tsx
    │   │   ├── accordion.tsx
    │   │   ├── alert-dialog.tsx
    │   │   ├── alert.tsx
    │   │   ├── aspect-ratio.tsx
    │   │   ├── avatar.tsx
    │   │   ├── badge.tsx
    │   │   ├── breadcrumb.tsx
    │   │   ├── button.tsx
    │   │   ├── calendar.tsx
    │   │   ├── card.tsx
    │   │   ├── carousel.tsx
    │   │   ├── chart.tsx
    │   │   ├── checkbox.tsx
    │   │   ├── collapsible.tsx
    │   │   ├── command.tsx
    │   │   ├── context-menu.tsx
    │   │   ├── copy-button.tsx
    │   │   ├── dialog.tsx
    │   │   ├── drawer.tsx
    │   │   ├── dropdown-menu.tsx
    │   │   ├── error-boundary.tsx
    │   │   ├── form-responsive.tsx
    │   │   ├── form-with-recovery.tsx
    │   │   ├── form.tsx
    │   │   ├── hover-card.tsx
    │   │   ├── icons-test-page.tsx
    │   │   ├── input-otp.tsx
    │   │   ├── input.tsx
    │   │   ├── label.tsx
    │   │   ├── menubar.tsx
    │   │   ├── navigation-menu.tsx
    │   │   ├── pagination.tsx
    │   │   ├── popover.tsx
    │   │   ├── progress.tsx
    │   │   ├── radio-group.tsx
    │   │   ├── resizable.tsx
    │   │   ├── scroll-area.tsx
    │   │   ├── select.tsx
    │   │   ├── separator.tsx
    │   │   ├── sheet.tsx
    │   │   ├── skeleton.tsx
    │   │   ├── slider.tsx
    │   │   ├── sonner.tsx
    │   │   ├── spinner.tsx
    │   │   ├── switch.tsx
    │   │   ├── table.tsx
    │   │   ├── tabs.tsx
    │   │   ├── textarea.tsx
    │   │   ├── theme-provider.tsx
    │   │   ├── toast.tsx
    │   │   ├── toaster.tsx
    │   │   ├── toggle-group.tsx
    │   │   ├── toggle.tsx
    │   │   ├── tooltip.tsx
    │   │   └── use-toast.ts
    ├── core
    │   ├── auth
    │   │   ├── __tests__
    │   │   │   ├── business-policies.test.tsx
    │   │   │   └── mfa.test.ts
    │   │   ├── events.ts
    │   │   ├── index.ts
    │   │   ├── interfaces.ts
    │   │   └── models.ts
    │   ├── config
    │   │   ├── AppInitializer.tsx
    │   │   ├── index.ts
    │   │   └── interfaces.ts
    │   ├── initialization
    │   │   ├── app-init.ts
    │   │   └── config.ts
    │   ├── notification
    │   │   ├── events.ts
    │   │   ├── index.ts
    │   │   ├── interfaces.ts
    │   │   └── models.ts
    │   ├── permission
    │   │   ├── __tests__
    │   │   │   └── permissions.test.ts
    │   │   ├── events.ts
    │   │   ├── interfaces.ts
    │   │   └── models.ts
    │   ├── team
    │   │   ├── events.ts
    │   │   ├── index.ts
    │   │   ├── interfaces.ts
    │   │   └── models.ts
    │   └── user
    │   │   ├── events.ts
    │   │   ├── index.ts
    │   │   ├── interfaces.ts
    │   │   └── models.ts
    ├── hooks
    │   ├── __tests__
    │   │   ├── useApiKeys.test.ts
    │   │   ├── usePayment.test.ts
    │   │   ├── usePermission.test.tsx
    │   │   ├── useSubscription.test.ts
    │   │   └── useTeamInvite.test.tsx
    │   ├── use-toast.ts
    │   ├── useAccountSettings.ts
    │   ├── useApiKeys.ts
    │   ├── useAuth.ts
    │   ├── useDebounce.ts
    │   ├── useDebounceEffect.ts
    │   ├── useDeleteAccount.ts
    │   ├── useMFA.ts
    │   ├── useOnboarding.ts
    │   ├── useOrganizationSession.ts
    │   ├── usePasswordReset.ts
    │   ├── usePayment.ts
    │   ├── usePermission.tsx
    │   ├── usePermissions.ts
    │   ├── usePlatformStyles.ts
    │   ├── useProfile.ts
    │   ├── useRegistration.ts
    │   ├── useRoles.ts
    │   ├── useSubscription.ts
    │   ├── useTeamInvitations.ts
    │   ├── useTeamInvite.ts
    │   ├── useTeamMembers.ts
    │   ├── useTeams.ts
    │   ├── useToast.ts
    │   ├── useUserProfile.ts
    │   └── useWebhooks.ts
    ├── lib
    │   ├── __tests__
    │   │   └── config.test.js
    │   ├── accountSwitcherApi.ts
    │   ├── api-keys
    │   │   ├── api-key-auth.ts
    │   │   └── api-key-utils.ts
    │   ├── api
    │   │   ├── auth
    │   │   │   └── factory.ts
    │   │   ├── axios.ts
    │   │   └── router.tsx
    │   ├── audit
    │   │   └── auditLogger.ts
    │   ├── auth
    │   │   ├── UserManagementClientBoundary.tsx
    │   │   ├── UserManagementProvider.tsx
    │   │   ├── __tests__
    │   │   │   ├── UserManagementProvider.test.tsx
    │   │   │   ├── mfa
    │   │   │   │   ├── email-verification.test.tsx
    │   │   │   │   ├── email.test.tsx
    │   │   │   │   ├── mfa.test.ts
    │   │   │   │   ├── setup.test.tsx
    │   │   │   │   ├── sms-verification.test.tsx
    │   │   │   │   └── verification.test.tsx
    │   │   │   ├── session
    │   │   │   │   └── business-policies.test.tsx
    │   │   │   └── sso
    │   │   │   │   ├── business-sso.test.tsx
    │   │   │   │   └── personal-sso.test.tsx
    │   │   ├── authConfig.ts
    │   │   ├── config.tsx
    │   │   ├── domainMatcher.ts
    │   │   ├── getUser.ts
    │   │   ├── hasPermission.ts
    │   │   ├── index.ts
    │   │   ├── session.ts
    │   │   └── utils.ts
    │   ├── config.ts
    │   ├── constants
    │   │   ├── countries.ts
    │   │   ├── oauthProviders.ts
    │   │   └── themeConstants.ts
    │   ├── context
    │   │   └── OrganizationContext.tsx
    │   ├── database
    │   │   ├── __tests__
    │   │   │   ├── database.test.tsx
    │   │   │   └── supabase.test.tsx
    │   │   ├── factory.ts
    │   │   ├── index.ts
    │   │   ├── migrations
    │   │   │   ├── 20240318000000_create_audit_logs.ts
    │   │   │   └── 20240501000000_create_retention_tables.ts
    │   │   ├── prisma.ts
    │   │   ├── providers
    │   │   │   └── supabase.ts
    │   │   ├── schemas
    │   │   │   └── retention.ts
    │   │   ├── supabase.ts
    │   │   └── types.ts
    │   ├── email
    │   │   ├── __tests__
    │   │   │   └── sendEmail.test.ts
    │   │   ├── sendEmail.ts
    │   │   ├── sendViaSendGrid.ts
    │   │   ├── teamInvite.ts
    │   │   └── types.ts
    │   ├── exports
    │   │   ├── company-export.service.ts
    │   │   ├── export.service.ts
    │   │   └── types.ts
    │   ├── hooks
    │   │   ├── use-toast.tsx
    │   │   ├── useOrganization.ts
    │   │   └── useProviderManagement.ts
    │   ├── i18n
    │   │   ├── config.ts
    │   │   ├── index.ts
    │   │   └── locales
    │   │   │   ├── en.json
    │   │   │   ├── en.ts
    │   │   │   ├── es.json
    │   │   │   └── fr.json
    │   ├── notifications
    │   │   └── sendCompanyNotification.ts
    │   ├── payments
    │   │   └── stripe.ts
    │   ├── profile
    │   │   └── verificationService.ts
    │   ├── rbac
    │   │   ├── __tests__
    │   │   │   └── roleService.test.ts
    │   │   ├── roleService.ts
    │   │   └── roles.ts
    │   ├── security
    │   │   ├── password-validation.ts
    │   │   └── security-policy.service.ts
    │   ├── services
    │   │   ├── notification-preferences.service.ts
    │   │   ├── notification-queue.service.ts
    │   │   ├── notification.service.ts
    │   │   ├── push-notification.service.ts
    │   │   └── retention.service.ts
    │   ├── sms
    │   │   └── sendSms.ts
    │   ├── stores
    │   │   ├── 2fa.store.ts
    │   │   ├── __tests__
    │   │   │   ├── auth.store.direct.test.ts
    │   │   │   ├── auth.store.minimal.test.ts
    │   │   │   ├── auth.store.test.ts
    │   │   │   ├── connected-accounts.store.test.ts
    │   │   │   ├── preferences.store.test.ts
    │   │   │   ├── subscription.store.test.ts
    │   │   │   └── user.store.test.ts
    │   │   ├── auth.store.ts
    │   │   ├── companyProfileStore.ts
    │   │   ├── connected-accounts.store.ts
    │   │   ├── oauth.store.ts
    │   │   ├── preferences.store.ts
    │   │   ├── profile.store.ts
    │   │   ├── rbac.store.ts
    │   │   ├── session.store.ts
    │   │   ├── subscription.store.ts
    │   │   └── user.store.ts
    │   ├── supabase.ts
    │   ├── utils.ts
    │   ├── utils
    │   │   ├── analytics.ts
    │   │   ├── csrf.ts
    │   │   ├── data-export.ts
    │   │   ├── file-upload.ts
    │   │   ├── getUserHomePage.ts
    │   │   ├── index.ts
    │   │   ├── responsive.ts
    │   │   ├── security.ts
    │   │   └── token.ts
    │   └── webhooks
    │   │   ├── __tests__
    │   │       └── webhook-sender.test.ts
    │   │   ├── triggerWebhook.ts
    │   │   └── webhook-sender.ts
    ├── middleware
    │   ├── __tests__
    │   │   ├── audit-log.test.ts
    │   │   ├── auth.test.js
    │   │   ├── csrf.test.ts
    │   │   ├── index.test.ts
    │   │   ├── permissions.test.ts
    │   │   ├── rate-limit.test.ts
    │   │   └── security-headers.test.ts
    │   ├── audit-log.ts
    │   ├── auth.js
    │   ├── cors.ts
    │   ├── csrf.ts
    │   ├── export-rate-limit.ts
    │   ├── index.ts
    │   ├── permissions.ts
    │   ├── rate-limit.ts
    │   ├── security-headers.ts
    │   ├── with-auth-rate-limit.ts
    │   └── with-security.ts
    ├── services
    │   ├── auth
    │   │   ├── __tests__
    │   │   │   ├── auth.store.test.ts
    │   │   │   ├── business-sso.test.tsx
    │   │   │   └── mocks
    │   │   │   │   ├── 2fa.store.mock.ts
    │   │   │   │   ├── auth.store.mock.ts
    │   │   │   │   ├── oauth.store.mock.ts
    │   │   │   │   └── session.store.mock.ts
    │   │   ├── default-auth.service.ts
    │   │   └── index.ts
    │   ├── notification
    │   │   ├── default-notification-service.ts
    │   │   ├── default-notification.handler.ts
    │   │   ├── default-notification.service.ts
    │   │   └── index.ts
    │   ├── permission
    │   │   ├── __tests__
    │   │   │   └── mocks
    │   │   │   │   └── rbac.store.mock.ts
    │   │   ├── default-permission.service.ts
    │   │   └── index.ts
    │   ├── team
    │   │   ├── default-team.service.ts
    │   │   └── index.ts
    │   └── user
    │   │   ├── __tests__
    │   │       ├── mocks
    │   │       │   ├── companyProfileStore.mock.ts
    │   │       │   ├── connected-accounts.store.mock.ts
    │   │       │   ├── preferences.store.mock.ts
    │   │       │   ├── profile.store.mock.ts
    │   │       │   ├── subscription.store.mock.ts
    │   │       │   └── user.store.mock.ts
    │   │       └── user.store.test.ts
    │   │   ├── default-user.service.ts
    │   │   └── index.ts
    ├── stores
    │   └── auth.store.ts
    ├── tests
    │   ├── i18nTestSetup.ts
    │   ├── integration
    │   │   ├── account-settings-flow.test.tsx
    │   │   ├── account-switching-flow.test.tsx
    │   │   ├── admin-users-flow.test.tsx
    │   │   ├── api-error-messages.test.tsx
    │   │   ├── backup.integration.test.tsx
    │   │   ├── collaboration-flow.test.tsx
    │   │   ├── connected-accounts.integration.test.tsx
    │   │   ├── dashboard-view-flow.test.tsx
    │   │   ├── data-management-flow.test.tsx
    │   │   ├── empty-states.test.tsx
    │   │   ├── error-recovery-flow.test.tsx
    │   │   ├── export-import-flow.test.tsx
    │   │   ├── feedback-submission-flow.test.tsx
    │   │   ├── file-upload-flow.test.tsx
    │   │   ├── form-validation-errors-isolated.test.tsx
    │   │   ├── form-validation-errors.test.tsx
    │   │   ├── minimal.smoke.test.tsx
    │   │   ├── notification-delivery.integration.test.tsx
    │   │   ├── notification-flow.test.tsx
    │   │   ├── notification-preferences.integration.test.tsx
    │   │   ├── oauth-buttons.integration.test.tsx
    │   │   ├── organization-security-policy.integration.test.tsx
    │   │   ├── password-reset-flow.test.tsx
    │   │   ├── search-filter-flow.test.tsx
    │   │   ├── session-management.integration.test.tsx
    │   │   ├── social-sharing-flow.test.tsx
    │   │   ├── sso-mfa-error-handling.integration.test.tsx
    │   │   ├── theme-settings-flow.test.tsx
    │   │   ├── user-auth-flow.test.tsx
    │   │   └── user-preferences-flow.test.tsx
    │   ├── mocks
    │   │   ├── 2fa.store.mock.ts
    │   │   ├── accountSwitcherApi.mock.ts
    │   │   ├── auth.store.mock.ts
    │   │   ├── browser.ts
    │   │   ├── companyProfileStore.mock.ts
    │   │   ├── connected-accounts.store.mock.ts
    │   │   ├── debug-auth.tsx
    │   │   ├── oauth.store.mock.ts
    │   │   ├── preferences.store.mock.ts
    │   │   ├── profile.store.mock.ts
    │   │   ├── rbac.store.mock.ts
    │   │   ├── redis.tsx
    │   │   ├── session.store.mock.ts
    │   │   ├── subscription.store.mock.ts
    │   │   ├── supabase spies.ts
    │   │   ├── supabase.ts
    │   │   ├── supabase.ts.bak
    │   │   ├── test-mocks.ts
    │   │   └── user.store.mock.ts
    │   ├── setup.ts
    │   ├── setup.tsx
    │   ├── smoke
    │   │   ├── app.smoke.test.tsx
    │   │   ├── login.smoke.test.tsx
    │   │   ├── profile.smoke.test.tsx
    │   │   └── registration.smoke.test.tsx
    │   ├── test-utils.tsx
    │   ├── testing-library.d.ts
    │   ├── ui
    │   │   └── DuplicateUIElements.test.tsx
    │   ├── utils
    │   │   ├── accountSwitcherApi-mock.ts
    │   │   ├── api-testing-utils.ts
    │   │   ├── browser-mock.ts
    │   │   ├── component-testing-utils.ts
    │   │   ├── debug-auth.tsx
    │   │   ├── environment-setup.ts
    │   │   ├── hook-testing-utils.ts
    │   │   ├── integration-testing-utils.ts
    │   │   ├── redis-mock.tsx
    │   │   ├── store-testing-utils.ts
    │   │   ├── supabase-spies.ts
    │   │   ├── test-mocks.ts
    │   │   ├── test-utils.tsx
    │   │   ├── testing-utils.ts
    │   │   └── zustand-test-helpers.ts
    │   ├── vitest.d.ts
    │   └── zustand-test-helpers.ts
    ├── types
    │   ├── 2fa.ts
    │   ├── auth.ts
    │   ├── company.ts
    │   ├── connected-accounts.ts
    │   ├── database.ts
    │   ├── errors.ts
    │   ├── feedback.ts
    │   ├── index.ts
    │   ├── jest-types.ts
    │   ├── lru-cache.d.ts
    │   ├── oauth.ts
    │   ├── organizations.ts
    │   ├── platform.ts
    │   ├── profile.ts
    │   ├── rbac.ts
    │   ├── react19.d.ts
    │   ├── subscription.ts
    │   ├── user-type.ts
    │   └── user.ts
    ├── ui
    │   ├── headless
    │   │   ├── account
    │   │   │   ├── AccountDeletion.tsx
    │   │   │   ├── AccountSwitcher.tsx
    │   │   │   └── DeleteAccountDialog.tsx
    │   │   ├── admin
    │   │   │   ├── AdminDashboard.tsx
    │   │   │   ├── AdminUsers.tsx
    │   │   │   ├── RetentionDashboard.tsx
    │   │   │   ├── RoleManagementPanel.tsx
    │   │   │   └── audit-logs
    │   │   │   │   └── AdminAuditLogs.tsx
    │   │   ├── audit
    │   │   │   └── AuditLogViewer.tsx
    │   │   ├── auth
    │   │   │   ├── AccountLockout.tsx
    │   │   │   ├── Auth.js
    │   │   │   ├── BackupCodesDisplay.tsx
    │   │   │   ├── BusinessSSOAuth.tsx
    │   │   │   ├── BusinessSSOSetup.tsx
    │   │   │   ├── ChangePasswordForm.tsx
    │   │   │   ├── DomainBasedOrgMatching.tsx
    │   │   │   ├── EmailVerification.tsx
    │   │   │   ├── ForgotPasswordForm.tsx
    │   │   │   ├── IDPConfiguration.tsx
    │   │   │   ├── LoginForm.tsx
    │   │   │   ├── LoginFormReact19.tsx
    │   │   │   ├── MFAManagementSection.tsx
    │   │   │   ├── MFASetup.tsx
    │   │   │   ├── MFAVerificationForm.tsx
    │   │   │   ├── OAuthButtons.tsx
    │   │   │   ├── OAuthCallback.tsx
    │   │   │   ├── OrganizationSSO.tsx
    │   │   │   ├── PasswordRequirements.tsx
    │   │   │   ├── PasswordResetForm.tsx
    │   │   │   ├── PasswordlessLogin.tsx
    │   │   │   ├── ProtectedRoute.tsx
    │   │   │   ├── ProviderManagementPanel.tsx
    │   │   │   ├── RegistrationForm.tsx
    │   │   │   ├── RememberMeToggle.tsx
    │   │   │   ├── ResetPasswordForm.tsx
    │   │   │   ├── SocialLoginCallbacks.tsx
    │   │   │   ├── TwoFactorSetup.tsx
    │   │   │   ├── __tests__
    │   │   │   │   ├── login-form.test.tsx
    │   │   │   │   └── registration-form.test.tsx
    │   │   │   └── withRole.tsx
    │   │   ├── common
    │   │   │   ├── DataTable.tsx
    │   │   │   ├── ErrorBoundary.tsx
    │   │   │   ├── FeedbackForm.tsx
    │   │   │   ├── FileManager.tsx
    │   │   │   ├── FormWithRecovery.tsx
    │   │   │   ├── NotificationCenter.tsx
    │   │   │   ├── PaletteThemeSwitcher.tsx
    │   │   │   ├── RateLimitFeedback.tsx
    │   │   │   ├── ReportingDashboard.tsx
    │   │   │   ├── ResponsiveExample.tsx
    │   │   │   ├── SearchResults.tsx
    │   │   │   ├── ThemeSettings.tsx
    │   │   │   ├── ThemeSwitcher.tsx
    │   │   │   └── UserPreferences.tsx
    │   │   ├── company
    │   │   │   ├── AddressCard.tsx
    │   │   │   ├── AddressDialog.tsx
    │   │   │   ├── CompanyProfileForm.tsx
    │   │   │   ├── DomainManagement.tsx
    │   │   │   ├── DomainVerification.tsx
    │   │   │   ├── NotificationPreferences.tsx
    │   │   │   ├── OrganizationSessionManager.tsx
    │   │   │   ├── SingleDomainVerification.tsx
    │   │   │   └── VerificationStatus.tsx
    │   │   ├── dashboard
    │   │   │   └── Dashboard.tsx
    │   │   ├── gdpr
    │   │   │   └── ConsentManagement.tsx
    │   │   ├── layout
    │   │   │   ├── Features.tsx
    │   │   │   ├── Footer.tsx
    │   │   │   ├── Header.tsx
    │   │   │   ├── Hero.tsx
    │   │   │   ├── Layout.tsx
    │   │   │   └── UserLayout.tsx
    │   │   ├── payment
    │   │   │   ├── InvoiceGenerator.tsx
    │   │   │   ├── PaymentForm.tsx
    │   │   │   ├── PaymentHistory.tsx
    │   │   │   ├── PaymentMethodList.tsx
    │   │   │   └── SubscriptionManager.tsx
    │   │   ├── permission
    │   │   │   ├── PermissionEditor.tsx
    │   │   │   └── RoleManager.tsx
    │   │   ├── profile
    │   │   │   ├── AccountSettings.tsx
    │   │   │   └── ProfileEditor.tsx
    │   │   ├── registration
    │   │   │   ├── MultiStepRegistration.tsx
    │   │   │   └── ProfileCompletion.tsx
    │   │   ├── search
    │   │   │   └── SearchPage.tsx
    │   │   ├── session
    │   │   │   ├── SessionPolicyEnforcer.tsx
    │   │   │   └── SessionTimeout.tsx
    │   │   ├── settings
    │   │   │   ├── AccountDeletion.tsx
    │   │   │   ├── DataExport.tsx
    │   │   │   ├── DataImport.tsx
    │   │   │   ├── LanguageSelector.tsx
    │   │   │   └── SettingsPanel.tsx
    │   │   ├── shared
    │   │   │   ├── ConnectedAccounts.tsx
    │   │   │   └── NotificationPreferences.tsx
    │   │   ├── sharing
    │   │   │   └── SocialSharingComponent.tsx
    │   │   ├── subscription
    │   │   │   ├── SubscriptionBadge.tsx
    │   │   │   ├── SubscriptionPlans.tsx
    │   │   │   └── withSubscription.tsx
    │   │   ├── team
    │   │   │   ├── InvitationManager.tsx
    │   │   │   ├── TeamCreator.tsx
    │   │   │   └── TeamMemberManager.tsx
    │   │   ├── theme
    │   │   │   └── theme-provider.tsx
    │   │   └── user
    │   │   │   └── __tests__
    │   │   │       └── profile.test.tsx
    │   ├── primitives
    │   │   ├── FileTypeIcon.tsx
    │   │   ├── PaletteProvider.tsx
    │   │   ├── accordion.tsx
    │   │   ├── alert-dialog.tsx
    │   │   ├── alert.tsx
    │   │   ├── aspect-ratio.tsx
    │   │   ├── avatar.tsx
    │   │   ├── badge.tsx
    │   │   ├── breadcrumb.tsx
    │   │   ├── button.tsx
    │   │   ├── calendar.tsx
    │   │   ├── card.tsx
    │   │   ├── carousel.tsx
    │   │   ├── chart.tsx
    │   │   ├── checkbox.tsx
    │   │   ├── collapsible.tsx
    │   │   ├── command.tsx
    │   │   ├── context-menu.tsx
    │   │   ├── copy-button.tsx
    │   │   ├── dialog.tsx
    │   │   ├── drawer.tsx
    │   │   ├── dropdown-menu.tsx
    │   │   ├── error-boundary.tsx
    │   │   ├── form-responsive.tsx
    │   │   ├── form-with-recovery.tsx
    │   │   ├── form.tsx
    │   │   ├── hover-card.tsx
    │   │   ├── icons-test-page.tsx
    │   │   ├── input-otp.tsx
    │   │   ├── input.tsx
    │   │   ├── label.tsx
    │   │   ├── menubar.tsx
    │   │   ├── navigation-menu.tsx
    │   │   ├── pagination.tsx
    │   │   ├── popover.tsx
    │   │   ├── progress.tsx
    │   │   ├── radio-group.tsx
    │   │   ├── resizable.tsx
    │   │   ├── scroll-area.tsx
    │   │   ├── select.tsx
    │   │   ├── separator.tsx
    │   │   ├── sheet.tsx
    │   │   ├── skeleton.tsx
    │   │   ├── slider.tsx
    │   │   ├── sonner.tsx
    │   │   ├── spinner.tsx
    │   │   ├── switch.tsx
    │   │   ├── table.tsx
    │   │   ├── tabs.tsx
    │   │   ├── textarea.tsx
    │   │   ├── theme-provider.tsx
    │   │   ├── toast.tsx
    │   │   ├── toaster.tsx
    │   │   ├── toggle-group.tsx
    │   │   ├── toggle.tsx
    │   │   ├── tooltip.tsx
    │   │   └── use-toast.ts
    │   └── styled
    │   │   ├── account
    │   │       ├── AccountDeletion.tsx
    │   │       ├── AccountSwitcher.tsx
    │   │       ├── DeleteAccountDialog.tsx
    │   │       └── __tests__
    │   │       │   └── DeleteAccountDialog.test.tsx
    │   │   ├── admin
    │   │       ├── AdminDashboard.tsx
    │   │       ├── AdminUsers.tsx
    │   │       ├── RetentionDashboard.tsx
    │   │       ├── RoleManagementPanel.tsx
    │   │       ├── __tests__
    │   │       │   ├── AdminDashboard.test.tsx
    │   │       │   └── RoleManagementPanel.test.tsx
    │   │       └── audit-logs
    │   │       │   └── AdminAuditLogs.tsx
    │   │   ├── audit
    │   │       ├── AuditLogViewer.tsx
    │   │       └── __tests__
    │   │       │   └── AuditLogViewer.test.tsx
    │   │   ├── auth
    │   │       ├── AccountLockout.tsx
    │   │       ├── Auth.js
    │   │       ├── BackupCodesDisplay.tsx
    │   │       ├── BusinessSSOAuth.tsx
    │   │       ├── BusinessSSOSetup.tsx
    │   │       ├── ChangePasswordForm.tsx
    │   │       ├── DomainBasedOrgMatching.tsx
    │   │       ├── EmailVerification.tsx
    │   │       ├── ForgotPasswordForm.tsx
    │   │       ├── IDPConfiguration.tsx
    │   │       ├── LoginForm.tsx
    │   │       ├── LoginFormReact19.tsx
    │   │       ├── MFAManagementSection.tsx
    │   │       ├── MFASetup.tsx
    │   │       ├── MFAVerificationForm.tsx
    │   │       ├── OAuthButtons.tsx
    │   │       ├── OAuthCallback.tsx
    │   │       ├── OrganizationSSO.tsx
    │   │       ├── PasswordRequirements.tsx
    │   │       ├── PasswordResetForm.tsx
    │   │       ├── PasswordlessLogin.tsx
    │   │       ├── ProtectedRoute.tsx
    │   │       ├── ProviderManagementPanel.tsx
    │   │       ├── RegistrationForm.tsx
    │   │       ├── RememberMeToggle.tsx
    │   │       ├── ResetPasswordForm.tsx
    │   │       ├── SocialLoginCallbacks.tsx
    │   │       ├── TwoFactorSetup.tsx
    │   │       ├── __tests__
    │   │       │   ├── BusinessSSOSetup.test.tsx
    │   │       │   ├── DomainBasedOrgMatching.test.tsx
    │   │       │   ├── IDPConfiguration.test.tsx
    │   │       │   ├── LoginForm.test.tsx
    │   │       │   ├── MFAManagementSection.test.tsx
    │   │       │   ├── MinimalTextareaForm.test.tsx
    │   │       │   ├── OrganizationSSO.test.tsx
    │   │       │   ├── ProtectedRoute.test.tsx
    │   │       │   ├── RegistrationForm.integration.test.tsx
    │   │       │   └── UpgradeToBusinessFlow.test.tsx
    │   │       └── withRole.tsx
    │   │   ├── common
    │   │       ├── DataTable.tsx
    │   │       ├── ErrorBoundary.tsx
    │   │       ├── FeedbackForm.tsx
    │   │       ├── FileManager.tsx
    │   │       ├── FormWithRecovery.tsx
    │   │       ├── NotificationCenter.tsx
    │   │       ├── PaletteThemeSwitcher.tsx
    │   │       ├── RateLimitFeedback.tsx
    │   │       ├── ReportingDashboard.tsx
    │   │       ├── ResponsiveExample.tsx
    │   │       ├── SearchResults.tsx
    │   │       ├── ThemeSettings.tsx
    │   │       ├── ThemeSwitcher.tsx
    │   │       └── UserPreferences.tsx
    │   │   ├── company
    │   │       ├── AddressCard.tsx
    │   │       ├── AddressDialog.tsx
    │   │       ├── CompanyProfileForm.tsx
    │   │       ├── DomainManagement.tsx
    │   │       ├── DomainVerification.tsx
    │   │       ├── NotificationPreferences.tsx
    │   │       ├── OrganizationSessionManager.tsx
    │   │       ├── SingleDomainVerification.tsx
    │   │       ├── VerificationStatus.tsx
    │   │       └── __tests__
    │   │       │   ├── DomainVerification.integration.test.tsx
    │   │       │   ├── OrganizationSessionManager.test.tsx
    │   │       │   └── SingleDomainVerification.test.tsx
    │   │   ├── dashboard
    │   │       └── Dashboard.tsx
    │   │   ├── gdpr
    │   │       ├── AccountDeletion.tsx
    │   │       ├── ConsentManagement.tsx
    │   │       └── DataExport.tsx
    │   │   ├── layout
    │   │       ├── Features.tsx
    │   │       ├── Footer.tsx
    │   │       ├── Header.tsx
    │   │       ├── Hero.tsx
    │   │       ├── Layout.tsx
    │   │       └── UserLayout.tsx
    │   │   ├── onboarding
    │   │       ├── FeatureTour.tsx
    │   │       ├── ProgressTracker.tsx
    │   │       ├── SetupWizard.tsx
    │   │       └── WelcomeScreen.tsx
    │   │   ├── payment
    │   │       ├── InvoiceGenerator.tsx
    │   │       ├── PaymentForm.tsx
    │   │       ├── PaymentHistory.tsx
    │   │       ├── PaymentMethodList.tsx
    │   │       └── SubscriptionManager.tsx
    │   │   ├── permission
    │   │       ├── PermissionEditor.tsx
    │   │       └── RoleManager.tsx
    │   │   ├── profile
    │   │       ├── AccountSettings.tsx
    │   │       ├── ActivityLog.tsx
    │   │       ├── AvatarUpload.tsx
    │   │       ├── CompanyDataExport.tsx
    │   │       ├── CompanyLogoUpload.tsx
    │   │       ├── CorporateProfileSection.tsx
    │   │       ├── DataExport.tsx
    │   │       ├── NotificationPreferences.tsx
    │   │       ├── PrivacySettings.tsx
    │   │       ├── Profile.jsx
    │   │       ├── ProfileEditor.tsx
    │   │       ├── ProfileForm.tsx
    │   │       ├── ProfileTypeConversion.tsx
    │   │       ├── ProfileVerification.tsx
    │   │       ├── SecuritySettings.tsx
    │   │       ├── SessionManagement.tsx
    │   │       └── __tests__
    │   │       │   ├── ActivityLog.test.tsx
    │   │       │   ├── AvatarUpload.test.tsx
    │   │       │   ├── CompanyDataExport.test.tsx
    │   │       │   ├── CompanyLogoUpload.test.tsx
    │   │       │   ├── CorporateProfileSection.test.tsx
    │   │       │   ├── DataExport.test.tsx
    │   │       │   ├── NotificationPreferences.test.tsx
    │   │       │   ├── PrivacySettings.test.tsx
    │   │       │   ├── Profile.test.tsx
    │   │       │   ├── ProfileEditor.test.tsx
    │   │       │   ├── ProfilePrivacySettings.test.tsx
    │   │       │   ├── ProfileTypeConversion.test.tsx
    │   │       │   ├── ProfileVerification.test.tsx
    │   │       │   └── SessionManagement.test.tsx
    │   │   ├── registration
    │   │       ├── MultiStepRegistration.tsx
    │   │       └── ProfileCompletion.tsx
    │   │   ├── search
    │   │       └── SearchPage.tsx
    │   │   ├── session
    │   │       └── SessionTimeout.tsx
    │   │   ├── settings
    │   │       ├── AccountDeletion.tsx
    │   │       ├── DataExport.tsx
    │   │       ├── DataImport.tsx
    │   │       ├── LanguageSelector.tsx
    │   │       └── SettingsPanel.tsx
    │   │   ├── shared
    │   │       ├── ConnectedAccounts.tsx
    │   │       └── NotificationPreferences.tsx
    │   │   ├── sharing
    │   │       └── SocialSharingComponent.tsx
    │   │   ├── team
    │   │       ├── InvitationManager.tsx
    │   │       ├── TeamCreator.tsx
    │   │       └── TeamMemberManager.tsx
    │   │   └── theme
    │   │       └── theme-provider.tsx
    └── utils
    │   └── __tests__
    │       └── domain-validation.test.ts
├── supabase
    ├── .branches
    │   └── _current_branch
    ├── .temp
    │   ├── cli-latest
    │   ├── gotrue-version
    │   ├── pooler-url
    │   ├── postgres-version
    │   ├── project-ref
    │   ├── rest-version
    │   └── storage-version
    ├── config.toml
    ├── functions
    │   └── cleanup-unverified-users
    │   │   └── index.ts
    └── migrations
    │   ├── 20240101000000_create_subscription_tables.sql
    │   ├── 20240516000000_initial_public_schema_full.sql
    │   ├── 20240519000000_create_company_domains.sql
    │   ├── 20240519000001_create_company_notifications.sql
    │   ├── 20240520000000_create_adapter_tables.sql
    │   ├── 20240601000000_create_data_exports_tables.sql
    │   └── 20240610_add_notification_preferences_and_recipients.sql
├── tailwind.config.js
├── temp
├── test-results.json
├── test-results
    ├── .last-run.json
    └── auth-personal-check-delete-fc212--find-delete-account-button-Desktop-Chrome
    │   └── test-failed-1.png
├── tsconfig.json
├── tsconfig.test.json
├── tsconfig.tsbuildinfo
├── update-tests.mjs
├── vitest-debug.json
├── vitest-report.json
├── vitest.config.ts
└── vitest.setup.ts
