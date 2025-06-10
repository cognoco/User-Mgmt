# Account Deletion Notification System

This document outlines the design for notifying users when they request account deletion.
It follows the architecture principles of keeping business logic in services and using the existing modular notification infrastructure.

## Goals
- Confirm receipt of a deletion request immediately.
- Provide status updates while the deletion job is running.
- Send a final confirmation once deletion completes.
- Include required legal information in every message.
- Deliver critical messages through both email and in-app channels.
- Handle notification failures with retries and error logging.
- Maintain delivery receipts for compliance audits.

## Architecture Fit
- Use the `NotificationService` and `INotificationDataProvider` interfaces
  to keep the implementation database agnostic.
- Delivery attempts and retries are managed by `NotificationQueueService`.
- UI components invoke a service method; they do not send notifications directly.

## Implementation Outline
1. **Request Receipt**
   - When a user initiates deletion (see the account deletion flow in the Phase&nbsp;1–2 specification),
     call `notificationService.sendEmail` and `sendInApp` with a template such as `accountDeletionRequestReceived`.
   - Store the resulting notification IDs via `createNotification` for tracking.
2. **Status Updates**
   - If deletion runs asynchronously, use `scheduleNotification` to inform the
     user when processing starts and when data is being anonymized.
   - Provide a link to a status page where the user can check progress.
3. **Completion Confirmation**
   - After deletion is finalized, send a confirmation message referencing the data
     retention rules. The email should note any grace period for backups.
4. **Legal Information**
   - Each message references the Data Retention Policy and includes a contact
     address for privacy inquiries.
5. **Multi‑Channel Delivery**
   - For critical notices, dispatch both email and in‑app notifications. Use
     `isChannelEnabled` to respect user preferences except for mandatory messages.
6. **Failure Handling**
   - `NotificationQueueService` retries transient failures using exponential
     back‑off. After the max attempts the entry is marked failed and logged.
   - Administrators can query failures through `getDeliveryStatus`.
7. **Delivery Receipts**
   - The provider records timestamps for creation, sending and delivery. These are
     retrievable with `getDeliveryStatus` and should be retained according to the
     compliance policy.

## Example Flow
```text
User clicks "Delete My Account"
→ Service queues receipt notification (email + in‑app)
→ Status update notifications fire as the job progresses
→ Final confirmation sent when deletion completes
→ Delivery receipts stored for audit purposes
```

## References
- [Account Deletion Flow](./functionality-features-phase1-2.md#25-account-deletion-api-auth-account)
- [Data Retention Policy](./DATA_RETENTION_POLICY.md)
- [`NotificationService` Interfaces](../../src/core/notification/interfaces.ts)
