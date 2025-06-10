# Error Handling Architecture

This document describes how the error utilities are structured in the codebase.

## Modules

| Module | Purpose |
|--------|---------|
| `src/core/common/errors.ts` | Defines the `ApplicationError` hierarchy and serialization helpers. |
| `src/lib/api/common/api-error.ts` | Wraps core errors for API responses. Includes helpers for common HTTP errors. |
| `src/lib/api/error-handler.ts` | Maps error codes to HTTP status codes and categories. |
| `src/lib/api/middleware/error-handler.middleware.ts` | Express-style wrapper that catches errors from API routes and returns a standardized JSON body. |
| `src/lib/monitoring/error-logger.ts` | Buffered logger used by service and API layers. |

## Error Flow

1. A service throws an `ApplicationError` subclass.
2. `withApiErrorHandling` in the API layer converts it to an `ApiError` and logs via `ErrorLogger`.
3. The API response contains a code and message which the client translates using `ERROR_CODE_DESCRIPTIONS`.

## Design Rationale

- Keeping codes in a central file prevents duplication and makes translation straightforward.
- Error classes are lightweight and serializable so they can be passed between serverless functions or queued jobs.
- Logging is buffered to avoid blocking the main request path but still ensures persistence through transports.

