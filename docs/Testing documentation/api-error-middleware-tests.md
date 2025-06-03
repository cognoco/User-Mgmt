# API Error Middleware Tests

This document outlines the key scenarios that must be covered when testing the API error handling middleware.

## Test API error handling

- **Verify middleware behavior**
  - Ensure each `ApiError` results in the correct HTTP status code.
  - Confirm that responses follow the `{ error: { code, message, category, details? } }` format.
  - In `NODE_ENV=production`, error details for server errors should be omitted.
  - Every response must contain the `X-Correlation-Id` header added by the monitoring utilities.

## Test specific error responses

- Validation errors return `400` with the `validation/error` code.
- Authentication failures produce `401` responses with the `auth/unauthorized` code.
- Authorization failures produce `403` responses with the `auth/forbidden` code.
- When rate limiting triggers, the middleware must return `429` with `server/operation_failed`.

## Test integration with monitoring

- `logApiError` should be called for every handled error with request context (IP, user-agent, path).
- Telemetry metrics must increment when errors occur and emit alerts for critical counts.
- Logged errors must include the correlation id from the request context.
- Monitoring hooks should receive the request information so alerts can be traced back.
