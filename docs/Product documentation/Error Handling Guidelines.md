# Error Handling Guidelines

This document outlines standard patterns for handling errors across the User Management module. Following these guidelines keeps the UX consistent and accessible.

For architecture details and a list of all error codes, see **Error Handling Overview.md** and **Error Code Reference.md**.

## 1. Form Validation

- **Inline validation** should occur as users type or blur a field.
- **Error messages** must be clear and positioned next to the related field using `FormMessage`.
- Use `FormErrorSummary` at the top of forms to list all errors for screen readers.
- Provide real‑time hints such as password requirements and suggestions for fixing common issues.

## 2. API Errors

- Use `useApiError` to translate API error codes into friendly text.
- Display errors with `ApiErrorAlert`, offering a retry option when possible.
- Differentiate user mistakes from system failures. System failures should encourage retrying later.
- Detect offline status with `useOfflineDetection` and prompt users to reconnect before retrying.

## 3. Authentication Errors

- Do not reveal whether a user account exists when login fails.
- Show password requirement hints using the `PasswordRequirements` component.
- Provide `MFATroubleshoot` on MFA screens to guide users through common problems.
- Offer links to account recovery flows where appropriate.

Adhering to these patterns ensures predictable error handling throughout the application.
