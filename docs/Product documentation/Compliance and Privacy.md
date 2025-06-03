# Compliance and Privacy Overview

This module implements privacy safeguards for error handling and audit logging.

## PII Redaction
- All error details and audit log entries pass through an automatic PII sanitizer.
- Patterns for emails, phone numbers, credit cards and SSNs are detected and replaced with `[REDACTED]`.
- Field names listed in the compliance configuration are also redacted.

## Audit Log Retention
- Audit logs are purged after a configurable period.
- Adjust the retention with the `AUDIT_LOG_RETENTION_DAYS` environment variable or `compliance.config.ts`.

## Data Retention
- Inactive account retention periods are configurable via `RETENTION_PERSONAL_MONTHS` and `RETENTION_BUSINESS_MONTHS`.

These settings ensure compliance with common regulations like GDPR by limiting the exposure of personal data.
