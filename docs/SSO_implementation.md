Documentation and test requirements

SSO Implementation: Documentation and Test Requirements
1. Overview of SSO Implementation
Supported SSO Flows & Providers
General SSO (Personal):
OAuth providers: Google, GitHub, Facebook, Twitter, Apple, Microsoft, LinkedIn (configurable).
Login/registration UI supports these providers.
Account linking/unlinking supported.
Business SSO (Organization):
SAML and OIDC supported for org-level SSO.
Admins can enable/disable SSO, select IDP type, configure endpoints/metadata.
SSO status and health monitoring for orgs.
Key Features Implemented
OAuth2/OIDC login and registration (with CSRF, state, PKCE)
SAML SSO for orgs (metadata, ACS, SLO, config UI)
Account linking/unlinking (with collision handling)
Audit logging for SSO login/linking events
Error handling for provider errors, permission issues, edge cases
UI feedback for all major flows
Flows Covered
Personal SSO login/signup (OAuth2/OIDC)
Business SSO login (SAML/OIDC)
Account linking/unlinking
Provider error handling (denied, missing email, revoked access, etc.)
Admin SSO configuration (enable/disable, IDP type, metadata, config)
SSO status monitoring (health, last login, errors)
2. Integration & E2E Test Requirements
Integration Tests (Component/API Level)
[ ] OAuthButtons: Renders correct providers, initiates login, handles errors
[ ] ConnectedAccounts: Shows linked providers, can link/unlink, error handling
[ ] BusinessSSOSetup: Enables/disables SSO, selects IDP type, saves settings
[ ] OrganizationSSO: Shows status, updates on settings change, displays help text
[ ] IDPConfiguration: Loads config, saves config, handles file upload, error states
[ ] API endpoints: /api/auth/oauth/*, /api/organizations/[orgId]/sso/* (settings, status, config)
[ ] Account linking API: Handles collisions, success, and error cases
[ ] Audit logging: SSO_LOGIN and SSO_LINK events are logged
E2E Tests (User Flow Level)
[ ] User can log in with each supported OAuth provider (Google, GitHub, etc.)
[ ] User can sign up with SSO and is redirected to dashboard
[ ] User denied by provider sees error and can retry
[ ] User with existing email is prompted to link accounts
[ ] User can link/unlink providers from settings
[ ] Organization admin can enable SSO, select IDP, and configure SAML/OIDC
[ ] Organization user can log in via business SSO (SAML/OIDC)
[ ] SSO status/health is displayed and updates after login attempts
[ ] Edge cases: revoked access, missing email, provider outage, etc.
3. Existing Test Coverage
Component/integration tests exist for:
OrganizationSSO
BusinessSSOSetup
IDPConfiguration
No E2E tests found yet (recommend adding for all major flows above)
Store-level and API-level tests for SSO/OAuth are limited; recommend expanding
4. Recommendations
Expand integration tests to cover all SSO-related UI and API edge cases
Add E2E tests for all user and admin SSO flows (see checklist above)
Ensure audit logging is tested for SSO events
Regularly review provider configs and update tests as new providers are added
