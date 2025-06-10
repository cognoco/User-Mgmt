# User Management System - Product Requirements Document (PRD)

## 1. Introduction

### 1.1 Purpose
The User Management System is a modular, pluggable authentication and user management solution designed to be easily integrated into any web or mobile application. It provides comprehensive user authentication, profile management, and team/organization management capabilities.

### 1.2 Scope
This document outlines the requirements for a standalone user management module that can be integrated into any application. The system will handle all aspects of user management, from registration and authentication to profile management and team organization.

### 1.3 Product Vision
To create a robust, secure, and flexible user management system that can be easily plugged into any application, providing a complete solution for authentication, profile management, and team organization while being database-agnostic and maintaining strict separation of frontend and backend concerns.

## 2. Technology Stack

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, Shadcn UI
- **State Management**: Zustand
- **Backend/Database**: Supabase (with design for database agnosticism)
- **Testing**: Vitest, React Testing Library, User Event, MSW, JSDOM, Testing Library Jest DOM, Playwright (E2E)
- **Infrastructure**: Database-agnostic architecture with initial Supabase implementation

## 3. Product Features and Requirements

The product will be developed in phases, with each phase building upon the previous one to create a comprehensive user management system.

### 3.1 Phase 1: Foundational Setup & Core Personal Authentication

#### 3.1.1 Personal User Registration
- Registration form with fields for First Name, Last Name, Email Address, Password, Confirm Password
- Dynamic password requirements helper that appears when typing in password field
- Requirement helper disappears when focus is lost and password meets requirements
- Mandatory checkbox for Terms and Conditions with clickable links to documents
- Success message with email verification instructions
- Client-side validation for all fields
- Server-side error handling for email duplication, terms acceptance, rate limiting

#### 3.1.2 User Login (Personal)
- Login form with Email Address and Password fields
- "Forgot Password" link
- "Remember Me" checkbox
- Link to Sign Up for new users
- Feedback for success, invalid credentials, unverified accounts, locked accounts
- Support for MFA verification (to be implemented in Phase 4)

#### 3.1.3 User Logout
- Accessible logout option in user profile dropdown
- Immediate session termination on server
- Redirection to login page or homepage
- Optional confirmation message

#### 3.1.4 Token Handling/Middleware
- Protection for authenticated routes
- Redirection to login for unauthenticated access attempts
- Session expiry handling with redirection to login
- Optional proactive session expiry warning

#### 3.1.5 Password Reset Request
- Form for email input to request password reset
- Clear instructions for the process
- Generic success message regardless of email existence (for security)
- Rate limiting for multiple requests

#### 3.1.6 Password Update (Post-Reset)
- Form with fields for new password and confirmation
- Dynamic password requirements helper
- Success confirmation and redirection to login
- Error handling for invalid/expired tokens, password mismatch

#### 3.1.7 Send Verification Email
- Option to resend verification email from login error or in-app prompt
- Confirmation message for email sent
- Rate limiting for multiple requests
- Error handling for already verified users

#### 3.1.8 Verify Email Address
- Verification link in email that opens in browser
- Success confirmation with login button/redirection
- Error handling for invalid/expired links, already verified accounts

#### 3.1.9 Update Password (Logged In)
- Form with fields for current password, new password, confirmation
- Dynamic password requirements helper
- Success confirmation
- Error handling for incorrect current password, mismatch, requirements
- Security notification email when password is changed

#### 3.1.10 Basic Error Handling
- Clear, plain language error messages
- Appropriate error message location (field-specific or general)
- Specific error descriptions with guidance when possible
- Consistent error styling throughout application
- Non-blocking UI for errors

#### 3.1.11 Input Validation
- Real-time validation feedback
- Visual cues for invalid fields
- Specific error messages for validation rules
- Disabled submit buttons until form validation passes
- Server-side validation for security

### 3.2 Phase 2: Personal User Profile & Account Management

#### 3.2.1 Get Personal Profile
- Display of user profile information
- Fields for Name, Email, Bio, Contact Information, Avatar
- Layout with clear sections
- Prompts for completing optional fields
- Edit button for profile modification

#### 3.2.2 Update Personal Profile
- Editable form with current profile data
- Fields for Name, Bio, Contact Information
- Save/Cancel buttons
- Success/error messages
- Validation for input fields

#### 3.2.3 Avatar Upload
- Option to set/change profile picture
- File selection with guidance on allowed formats/sizes
- Image cropping/preview functionality
- Success/error feedback
- Client-side validation for file type/size

#### 3.2.4 Profile Visibility
- Controls for setting profile visibility (public/private)
- Clear explanations of visibility settings
- Automatic or manual saving of changes
- Success/error messages

#### 3.2.5 Account Deletion
- Access to account deletion in settings
- Warning about permanent deletion consequences
- Multi-step confirmation process
- Success feedback with redirection
- Error handling for confirmation failures

### 3.3 Phase 3: Business User Registration & Core Profile

#### 3.3.1 Business Registration
- Registration form with user fields and company fields
- User fields: First Name, Last Name, Email, Password, Confirm Password
- Company fields: Company Name, Size, Industry, Website
- User Role fields: Position/Job Title, Department
- Terms & Conditions checkbox
- Success message with verification instructions
- Validation and error handling

#### 3.3.2 Get Business Profile
- Display of combined personal and company information
- Sections for User Info and Company Info
- Verification status display
- Edit buttons with permission controls

#### 3.3.3 Update Business Profile
- Editable form for company details
- Fields for Company Name, Size, Industry, Website, Contact, Address, VAT ID
- Save/Cancel buttons
- Permission-based access control
- Success/error messages

#### 3.3.4 Company Logo Upload
- Option to upload/change company logo
- File selection with guidance
- Cropping/preview functionality
- Success/error feedback
- Permission-based access control

#### 3.3.5 Business Address Management
- Structured address fields in business profile
- Support for international address formats
- Optional address validation/lookup integration

#### 3.3.6 Company Validation
- Process for verifying company legitimacy
- Status indicators for validation state
- Manual or automatic trigger
- Success/error feedback

#### 3.3.7 Business Domain Verification
- Process for proving ownership of company domain
- Method implementation (DNS, email)
- Clear instructions for verification steps
- Status display
- Success/error feedback

### 3.4 Phase 4: Advanced Authentication (MFA, SSO)

#### User Journeys
- **MFA Setup:**
  1. User logs in, is prompted to set up MFA (if required by policy).
  2. User selects MFA method (TOTP app, SMS, email).
  3. System displays QR code or sends code.
  4. User enters code to verify setup.
  5. Success feedback; backup codes offered.
- **MFA Login:**
  1. User enters credentials.
  2. Prompted for MFA code.
  3. User enters code; access granted or error shown.
- **SSO Login:**
  1. User clicks "Sign in with Google/Microsoft/SSO Provider."
  2. Redirected to provider, authenticates, returns to app.
  3. If first login, prompted to complete profile.

#### UI/UX Expectations
- Clear, stepwise MFA setup wizard.
- Accessible QR code display, copy-paste fallback.
- Backup code download/copy with warning to store securely.
- Error feedback for invalid/expired codes.
- SSO buttons styled per provider guidelines.
- Loading indicators for external redirects.

#### API Endpoints
- `POST /api/auth/mfa/setup`
  - Request: `{ method: "totp" | "sms" | "email" }`
  - Response: `{ qrCodeUrl?: string, secret?: string, smsSent?: boolean }`
- `POST /api/auth/mfa/verify`
  - Request: `{ code: string }`
  - Response: `{ success: boolean, backupCodes?: string[] }`
- `POST /api/auth/mfa/disable`
  - Request: `{ password: string, code: string }`
- `POST /api/auth/sso/initiate`
  - Request: `{ provider: "google" | "microsoft" | ... }`
  - Response: `{ redirectUrl: string }`
- `POST /api/auth/sso/callback`
  - Request: `{ code: string, state: string }`
  - Response: `{ token: string, profile: {...} }`

#### Role/Permission Implications
- MFA required for roles: admin, owner, configurable for others.
- SSO may be restricted to business/org users.
- Only user or admin can disable MFA.

#### Error Handling & Edge Cases
- Invalid/expired MFA codes.
- SSO provider errors (network, denied consent).
- MFA lockout after N failed attempts.
- Backup code usage and regeneration.

#### Integration Points & Extensibility
- Pluggable MFA providers (TOTP, SMS, email, WebAuthn).
- SSO provider registry (add/remove via config).
- Hooks/events for successful/failed authentication.

### 3.5 Phase 5: Team Management

#### User Journeys
- **Team Creation:**
  1. User navigates to "Teams," clicks "Create Team."
  2. Enters team name, description, visibility.
  3. Team created; user is owner.
- **Invite Member:**
  1. Owner/admin clicks "Invite," enters email/role.
  2. Invite sent; user receives email, accepts, joins team.
- **Role Assignment:**
  1. Owner/admin edits member, selects new role.
  2. Member permissions update immediately.

#### UI/UX Expectations
- Team list with search/filter.
- Member list with roles, status (pending, active).
- Invite flow with email preview, resend option.
- Role dropdowns, permission tooltips.
- Confirmation dialogs for removals.

#### API Endpoints
- `POST /api/teams`
  - Request: `{ name: string, description?: string, visibility: "private" | "public" }`
- `POST /api/teams/:teamId/invite`
  - Request: `{ email: string, role: string }`
- `POST /api/teams/:teamId/members/:memberId/role`
  - Request: `{ role: string }`
- `DELETE /api/teams/:teamId/members/:memberId`
- `GET /api/teams/:teamId`

#### Role/Permission Implications
- Roles: owner, admin, member, guest.
- Only owner/admin can invite/remove or change roles.
- Guests have read-only access.

#### Error Handling & Edge Cases
- Duplicate invites.
- Invite expiration.
- Removing last owner (prevent).
- Team deletion confirmation.

#### Integration Points & Extensibility
- Webhooks for member join/leave.
- Custom roles/permissions via config.
- Team-scoped API tokens.

### 3.6 Phase 6: Subscription & Billing

#### User Journeys
- **Upgrade Plan:**
  1. User visits billing page, sees current plan.
  2. Selects new plan, enters payment info.
  3. Confirmation, immediate access to new features.
- **View Invoices:**
  1. User views billing history, downloads invoices.

#### UI/UX Expectations
- Plan comparison table.
- Secure payment form (PCI-compliant).
- Invoice list with download links.
- Clear error/success messages.

#### API Endpoints
- `GET /api/billing/plans`
- `POST /api/billing/subscribe`
  - Request: `{ planId: string, paymentMethod: {...} }`
- `GET /api/billing/invoices`
- `POST /api/billing/cancel`
- `POST /api/billing/update-payment`

#### Role/Permission Implications
- Only billing admins/owners can manage subscriptions.
- Members can view plan/invoices.

#### Error Handling & Edge Cases
- Payment failures (card declined, expired).
- Prorated upgrades/downgrades.
- Grace period for failed payments.

#### Integration Points & Extensibility
- Pluggable payment providers (Stripe, Paddle, etc.).
- Webhooks for payment events.
- API for external billing system sync.

### 3.7 Phase 7: Enterprise Features

#### User Journeys
- **Audit Log Review:**
  1. Admin navigates to "Audit Logs."
  2. Filters by user, action, date.
  3. Views details, exports logs.
- **Custom Security Policy:**
  1. Admin sets password/MFA/session policies.
  2. Changes take effect for all users.

#### UI/UX Expectations
- Log table with filters, export (CSV/JSON).
- Policy editor with validation, previews.
- Compliance status indicators.

#### API Endpoints
- `GET /api/audit/logs`
  - Query: `?userId=&action=&dateFrom=&dateTo=`
- `POST /api/security/policies`
  - Request: `{ policyType: string, config: {...} }`
- `GET /api/security/policies`

#### Role/Permission Implications
- Only enterprise admins can access logs/policies.
- Policy changes may require re-authentication.

#### Error Handling & Edge Cases
- Large log exports (pagination, limits).
- Invalid policy configs (validation errors).

#### Integration Points & Extensibility
- Custom policy plugins.
- External SIEM/logging integrations.
- API for compliance reporting.

### 3.8 Phase 8: Platform Support & Integration

#### User Journeys
- **API Key Generation:**
  1. User visits "Integrations," clicks "Create API Key."
  2. Names key, sets scopes, copies key.
- **Webhook Setup:**
  1. User adds webhook URL, selects events.
  2. System sends test event, confirms delivery.

#### UI/UX Expectations
- API key list with scopes, last used.
- Webhook list with status, resend/test buttons.
- Clear warnings about key exposure.

#### API Endpoints
- `POST /api/integrations/api-keys`
  - Request: `{ name: string, scopes: string[] }`
- `DELETE /api/integrations/api-keys/:keyId`
- `POST /api/integrations/webhooks`
  - Request: `{ url: string, events: string[] }`
- `POST /api/integrations/webhooks/test`
- `DELETE /api/integrations/webhooks/:webhookId`

#### Role/Permission Implications
- Only admins can create/delete API keys and webhooks.
- Scopes restrict API key access.

#### Error Handling & Edge Cases
- Duplicate key/webhook names.
- Webhook delivery failures (retries, status).
- Key revocation and audit.

#### Integration Points & Extensibility
- Pluggable webhook event types.
- API for external integration management.
- Custom API key scopes.

## 4. Non-Functional Requirements

### 4.1 Performance
- Page load time under 2 seconds
- API response time under 500ms
- Support for concurrent users

### 4.2 Security
- HTTPS for all connections
- Secure password storage (hashing)
- Protection against common attacks (XSS, CSRF, SQL Injection)
- Rate limiting for sensitive operations
- Token-based authentication

### 4.3 Scalability
- Horizontal scaling capability
- Database connection pooling
- Caching strategies for frequently accessed data

### 4.4 Reliability
- 99.9% uptime
- Automatic error recovery
- Graceful degradation during partial system failures

### 4.5 Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast

### 4.6 Internationalization
- Support for multiple languages
- Culture-specific formatting (dates, numbers)
- RTL language support

### 4.7 Modularity & Pluggability
- Clear separation between core and extended features
- Easy enabling/disabling of non-core features
- Well-defined integration points for host applications

### 4.8 Database Agnosticism
- Clean separation of database access code
- Adapter pattern for database operations
- Initial implementation with Supabase

## 5. Technical Architecture

### 5.1 Directory Structure
```
/
├── e2e/                  # End-to-End (Playwright) tests
├── app/                  # Next.js App Router pages and API routes
├── src/                  # Core source code
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Core libraries and utilities
│   ├── middleware/       # Next.js middleware
│   ├── types/            # TypeScript type definitions
│   └── tests/            # Generic test utilities, mocks, and non-Playwright integration tests
├── public/               # Static assets
├── docs/                 # Documentation
└── scripts/              # Utility scripts
```

### 5.2 Key Components
- Next.js App Router for page routing and API routes
- React components organized by feature domain
- Zustand stores for state management
- Supabase for initial database implementation
- React Hook Form with Zod for form validation
- Shadcn UI for component library

### 5.3 Authentication Flow
- JWT-based authentication
- Token refresh mechanism
- Session management
- Role-based access control

## 6. User Experience Requirements

### 6.1 Responsive Design
- Mobile-first approach
- Responsive layouts for all screen sizes
- Touch-friendly UI elements

### 6.2 Consistent UI
- Uniform design language throughout
- Consistent positioning of navigation elements
- Standard error and success message patterns

### 6.3 Intuitive Navigation
- Clear navigation hierarchy
- Breadcrumbs for complex flows
- Easily accessible back buttons

### 6.4 Error Handling
- Clear error messages in plain language
- Contextual error display
- Suggested resolution steps where applicable

## 7. Implementation Constraints

- Database-agnostic design with initial Supabase implementation
- Strict separation of frontend and backend code
- No changing existing functionality to please test files
- No introduction of new technologies without approval
- Must adhere to file structure guidelines

## 8. Testing & Mocking

### 8.1 Testing Philosophy
- **Production-first, test-second:** Tests mirror real user flows and production scenarios.
- **E2E focus:** End-to-end tests for all critical flows (auth, profile, billing, etc.).
- **No "test-only" code paths:** All test hooks must be production-safe.

### 8.2 Test Types & Priorities
- **E2E (Playwright):** Registration, login, MFA, billing, team management, integrations.
- **Integration (Vitest, RTL):** Component interactions, API integration, error boundaries.
- **Unit:** Only for complex logic (validation, adapters).
- **Accessibility (a11y):** Automated checks for all forms and flows.
- **Internationalization (i18n):** Key flows tested in multiple languages.

### 8.3 Mocking Strategy
- **Global only:** All mocks (API, network, etc.) are global (MSW).
- **No local mocks:** No per-test or per-file mocks.
- **MSW for API mocking:** All network requests intercepted at the global level.

### 8.4 Coverage Requirements
- **Mirror implementation:** Test coverage must reflect real user flows and edge cases.
- **Critical flows:** Registration, login, MFA, billing, team management, integrations.
- **Edge cases:** Error states, permission denials, expired tokens, etc.

### 8.5 Known Gaps & Improvement Plan
- **Summarized from [GAP_ANALYSIS.md](../Project documentation/GAP_ANALYSIS.md):**
  - Some edge cases (e.g., SSO errors, billing proration) need more E2E coverage.
  - Accessibility and i18n coverage to be expanded in Phases 4–8.
  - Mocking for new API endpoints to be added to global MSW handlers.
  - Plan: Review and update test suites after each phase, referencing GAP_ANALYSIS.md.

### 8.6 References to Key Docs
- [TESTING.md](../Testing documentation/TESTING.md)
- [TESTING_ISSUES.md](../Testing documentation/TESTING_ISSUES.md)
- [GAP_ANALYSIS.md](../Project documentation/GAP_ANALYSIS.md)

## 9. Explicit API/Role/Extensibility Details

- **API Request/Response Examples:** See each phase above for endpoint and payload details.
- **Role/Permission Matrix:** See [auth-roles.md](auth-roles.md) for full role and permission definitions.
- **Integration/Extensibility Points:** Each phase lists extensibility hooks (e.g., pluggable providers, webhooks, custom policies). Reference or link to integration guides or API docs as they are developed.

## 10. Glossary

- **MFA**: Multi-Factor Authentication
- **SSO**: Single Sign-On
- **JWT**: JSON Web Token
- **WCAG**: Web Content Accessibility Guidelines
- **RTL**: Right-to-Left (languages)
- **UI**: User Interface
- **UX**: User Experience
- **API**: Application Programming Interface
- **E2E**: End-to-End (testing) 