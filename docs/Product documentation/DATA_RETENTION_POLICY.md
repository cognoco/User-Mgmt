# Data Retention Policy

This document outlines the data retention policies for the User Management System. Specific retention periods should be defined based on legal requirements (e.g., GDPR, CCPA) and business needs.

## 1. User Accounts & Profiles

*   **Inactive User Accounts:**
    *   **Definition of Inactivity:** [Define criteria, e.g., no login for X months/years]
    *   **Action:** [e.g., Anonymize, Delete]
    *   **Retention Period:** [Specify period, e.g., 24 months after last login]
    *   **Notification:** [Will users be notified before deletion? e.g., Yes, 30 days prior]
*   **Deleted User Accounts:**
    *   **Action:** [e.g., Hard delete, Soft delete with grace period]
    *   **Retention Period:** [Specify period for any remaining data after deletion request, e.g., 30 days for backup purposes]
*   **Profile Data (Personal & Company):**
    *   **Retention tied to:** [e.g., Account status]
    *   **Specific Fields (if different):** [e.g., Address history might be kept longer/shorter]

## 2. Uploaded Documents

*   **Company Verification Documents (e.g., Registration, Tax):**
    *   **Status: Verified:** [Retention period after successful verification, e.g., Delete immediately, Keep for 6 months]
    *   **Status: Rejected:** [Retention period after rejection, e.g., 30 days]
    *   **Status: Pending (Expired):** [Retention period if verification is abandoned, e.g., 90 days]
*   **User Avatars / Company Logos:**
    *   **Retention tied to:** [e.g., Account/Profile status]
    *   **Old Versions:** [Are previous versions kept? If so, for how long?]

## 3. Authentication & Security Data

*   **Session Tokens/Data:**
    *   **Retention Period:** [e.g., Based on session expiration settings]
*   **Password Reset Tokens:**
    *   **Retention Period:** [e.g., Short-lived, deleted after use or expiration (e.g., 1 hour)]
*   **2FA Codes/Secrets:**
    *   **Retention tied to:** [e.g., Account status, deleted when 2FA is disabled]
*   **Security Event Logs / Audit Logs:**
    *   **Scope:** [What actions are logged?]
    *   **Retention Period:** [Specify period, e.g., 12 months]
    *   **Anonymization:** [Are logs anonymized after a certain period?]

## 4. Activity Logs

*   **User Activity (e.g., login history, key actions):**
    *   **Retention Period:** [Specify period, e.g., 6 months]

## 5. Implementation Notes

*   **Mechanism:** [e.g., Scheduled serverless functions (Supabase Edge Functions with cron), Database triggers, Manual process]
*   **Verification:** [How will policy enforcement be verified? e.g., Logging, Audits]
*   **Deletion Method:** [Hard delete vs. Soft delete/Anonymization]

## 6. Policy Review

*   **Review Frequency:** [e.g., Annually]
*   **Last Reviewed:** [Date]
*   **Next Review:** [Date] 