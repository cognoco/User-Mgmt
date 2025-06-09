# Error Code Reference

The tables below list all defined error codes grouped by domain. Each code maps to an HTTP status returned by the API layer via `ERROR_MAP`.

## Authentication Errors (`AUTH_XXX` / `auth/*`)

| Code | Description | Possible Causes | Resolution | HTTP Status |
|------|-------------|-----------------|------------|-------------|
| auth/unauthorized | Authentication required | Missing or invalid credentials | Log in and retry | 401 |
| auth/forbidden | Access denied | User lacks permission | Check role or scope | 403 |
| auth/invalid_credentials | Invalid credentials | Wrong password or unknown email | Reset credentials | 401 |
| auth/email_not_verified | Email not verified | Account created but email not confirmed | Verify email or resend link | 403 |
| auth/mfa_required | Multi factor authentication required | MFA enabled for user | Complete MFA challenge | 403 |
| auth/account_locked | Account locked | Too many failed attempts or admin action | Contact support | 403 |
| auth/password_expired | Password expired | Password rotation policy | Reset password | 403 |
| auth/session_expired | Session expired | Token lifetime exceeded | Log in again | 401 |
| auth/token_refresh_failed | Token refresh failed | Network or server error | Retry later | 401 |
| auth/invalid_refresh_token | Invalid refresh token | Token revoked or reused | Log in again | 401 |

## User Management Errors (`USER_XXX` / `user/*`)

| Code | Description | Possible Causes | Resolution | HTTP Status |
|------|-------------|-----------------|------------|-------------|
| user/not_found | User not found | Invalid user id | Ensure id is correct | 404 |
| user/already_exists | User already exists | Duplicate email/username | Choose different identifier | 409 |
| user/invalid_data | Invalid user data | Validation failed | Fix input and retry | 400 |
| user/update_failed | Update failed | Database error or validation | Retry or contact support | 500 |
| user/delete_failed | Delete failed | Database error or foreign key constraint | Retry or contact support | 500 |

## Team & Permission Errors (`TEAM_XXX`, `PERM_XXX`)

| Code | Description | Possible Causes | Resolution | HTTP Status |
|------|-------------|-----------------|------------|-------------|
| team/not_found | Team not found | Invalid team id | Verify id | 404 |
| team/already_exists | Team already exists | Duplicate name or slug | Use another name | 409 |
| team/invalid_data | Invalid team data | Validation failed | Fix input and retry | 400 |
| team/update_failed | Team update failed | Backend error | Retry later | 500 |
| team/delete_failed | Team delete failed | Backend error | Retry later | 500 |
| team/member_not_found | Member not found | Invalid user id | Check membership | 404 |
| team/member_already_exists | Member already exists | Duplicate invite | Remove duplicate | 409 |
| permission/not_found | Permission not found | Invalid permission key | Verify key | 404 |
| permission/already_exists | Permission already exists | Duplicate permission | Avoid duplicates | 409 |
| permission/invalid_data | Invalid permission data | Validation error | Fix input | 400 |
| permission/update_failed | Permission update failed | Backend error | Retry or contact support | 500 |
| permission/delete_failed | Permission delete failed | Backend error | Retry or contact support | 500 |
| permission/assignment_failed | Permission assignment failed | Invalid mapping or backend error | Verify request | 500 |

## Data Management Errors (`DATA_XXX`)

Validation errors are used for most data issues.

| Code | Description | Possible Causes | Resolution | HTTP Status |
|------|-------------|-----------------|------------|-------------|
| validation/error | Validation failed | Request body did not match schema | Fix fields and retry | 400 |
| validation/missing_field | Required field missing | Payload incomplete | Supply all required fields | 400 |
| validation/invalid_format | Invalid field format | Wrong type or regex mismatch | Correct field value | 400 |

## Infrastructure Errors (`INFRA_XXX` / `server/*`)

| Code | Description | Possible Causes | Resolution | HTTP Status |
|------|-------------|-----------------|------------|-------------|
| server/internal_error | Internal server error | Unhandled exception | Try again later | 500 |
| server/service_unavailable | Service unavailable | Dependency outage | Retry when service recovers | 503 |
| server/database_error | Database error | Connection or query failure | Retry or contact support | 500 |
| server/operation_failed | Operation failed | Unexpected issue | Retry or contact support | 500 |
| server/retrieval_failed | Retrieval failed | Backend could not load data | Retry or contact support | 500 |
| server/delete_failed | Delete failed | Could not delete resource | Retry or contact support | 500 |

## Searching and Filtering

Run `node scripts/filter-error-codes.js <query>` to search by code or description. Use `--domain auth` to limit by domain. The script can also sort a log file of errors to show frequency or impact.

