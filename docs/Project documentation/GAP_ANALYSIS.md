# Gap Analysis

This document summarises the remaining feature gaps in the User Management module. Most of the originally planned functionality is implemented and tested. The items below outline the key areas that still require work.

## Multi-Factor Authentication
- SMS-based MFA is not implemented.
- Email-based MFA is not implemented.
- Related verification routes and notifications are pending.

## Account Linking
- Linking additional OAuth providers to an existing account is incomplete.
- Merging and conflict resolution flows are missing.
- Automated tests for these scenarios are absent.

## Admin Dashboard
- A unified dashboard for managing users, roles and security policies is still missing.
- Existing admin pages do not provide a full management interface.

## Validation and Compliance
- Validation endpoints for company registration and tax ID are marked as TODO.
- Some forms rely only on minimal client-side validation.

## Placeholder Implementations
- The `DefaultTwoFactorAuthService` and `SupabaseTwoFactorAuthProvider` are not implemented.
- A `DefaultWebhookService` is missing.
- A generic `use[DomainName]` hook template is still pending.
- Documentation guides such as the architecture overview and integration guide remain to be written.

## References
For a detailed list of implemented features see [Implementation-Checklist](../Product%20documentation/Implementation-Checklist.md).
