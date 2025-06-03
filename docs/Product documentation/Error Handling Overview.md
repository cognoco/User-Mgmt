# Error Handling Overview

This document describes how errors are structured and propagated throughout the User Management module. It expands upon the short guidelines in **Error Handling Guidelines.md** and should be read by anyone integrating or extending the module.

## Philosophy

Errors are first–class objects. They carry a unique code, a human friendly message and enough context to allow graceful recovery. The same structure is used on the server and in the browser so that errors can be logged, serialized and rehydrated consistently.

### Error Hierarchy

The core layer defines `ApplicationError` as the base class. Specialised subclasses such as `ValidationError`, `AuthenticationError` and `DatabaseError` provide semantic meaning and map to HTTP status codes. API routes translate these into `ApiError` instances before sending them to the client.

### Flow Through the Application

1. **Service Layer** – Services throw `ApplicationError` subclasses when a business rule fails.
2. **API Layer** – `withApiErrorHandling` converts thrown errors into JSON responses using `createErrorResponse`.
3. **UI Layer** – Hooks catch `ApiError` and surface a translated message to components via helpers like `useApiError`.

This flow ensures errors are captured once and transformed for each layer.

### Benefits of the Standardised Approach

- Predictable error shapes simplify API clients and logging.
- Centralised handling allows consistent localisation and monitoring.
- Subclasses make it easy to determine user‑correctable vs. system errors.

## Developer Guide

### Creating and Throwing Errors

Use the helpers in `@/core/common/errors` or `@/lib/utils/error-factory` to create errors. For example:

```ts
import { createError, AUTH_ERROR } from '@/core/common/errors';
throw createError(AUTH_ERROR.AUTH_002, 'Invalid credentials');
```

### Catching and Handling

Wrap service calls with `withErrorHandling` or API handlers with `withApiErrorHandling`. These utilities log the error and convert it to the standard format.

```ts
const user = await withErrorHandling(() => userService.get(id), {
  service: 'userService',
  method: 'get',
});
```

### Common Patterns

- Validation failures -> `ValidationError`
- Auth failures -> `AuthenticationError`
- Database issues -> `DatabaseError`

### Adding New Error Types

1. Add a code to `error-codes.ts` under the relevant domain.
2. Create a subclass of `ApplicationError` if behaviour differs (e.g. HTTP status).
3. Update `ERROR_CODE_DESCRIPTIONS` so messages can be translated.

## Implementation Details

### Structure and Properties

All errors extend `ApplicationError` which includes:

- `code` – unique identifier
- `message` – user friendly message
- `httpStatus` – suggested HTTP response code
- `details` – optional structured data
- `timestamp` – creation time

### Serialization

`serializeError()` and `deserializeError()` convert errors to JSON so they can cross process boundaries or be stored in logs.

### Monitoring and Logging

`ErrorLogger` transports errors to console, file or external services. Use `logServiceError` and `logApiError` to record context.

### Error Translation

`useApiError` and the `ERROR_CODE_DESCRIPTIONS` map translate codes into end user messages. Services should only send codes and allow the UI to translate.

