# SSO Troubleshooting Guide

This guide provides steps to diagnose and resolve common Single Sign-On (SSO) issues.

## Provider Authorization Errors
* **Symptom:** Users see "Authorization denied" or "access_denied".
* **Resolution:** Verify the provider application settings and ensure the redirect URL matches your deployment.

## Invalid Configuration
* **Symptom:** Login attempts fail immediately and logs show configuration errors.
* **Resolution:** Check client ID, secret and metadata URLs. Update any expired certificates.

## Federation Failures
* **Symptom:** Authentication succeeds but federation to an internal account fails.
* **Resolution:** Confirm the user email domain is allowed and the account is not already linked with another provider.

## Network Issues
* **Symptom:** Requests to the provider time out.
* **Resolution:** Ensure outbound network access to the provider domain. Retry after verifying connectivity.

## Capturing Diagnostics
All SSO operations log detailed diagnostics via the `ErrorLogger`. Review `error.log` for entries tagged with `service: "sso"` to trace failures.
