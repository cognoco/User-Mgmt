# User Registration & Email Verification - Systematic Troubleshooting

This document outlines the systematic approach to diagnosing and fixing the failures in the core user registration and email verification flow.

## 1. Target Flow (Expected Behavior)

1.  **User Fills Form:** User completes the registration form (`RegistrationForm.tsx`) with valid email and password.
2.  **Form Submission:** User clicks "Register". The form initiates a client-side Supabase `signUp` call.
3.  **User Record Creation / Update:**
    *   **New User:** Supabase creates a record in `auth.users`.
    *   **Existing Unverified User:** Supabase finds the existing record, potentially updates timestamps.
4.  **Verification Email Sent / Re-sent:** Supabase automatically sends (or re-sends) a verification email containing a unique link (with OTP) to the user's provided email address.
5.  **User Redirected:** User is redirected to the `/check-email` page, displaying a message to check their inbox.
    *   *(Improvement Gap): Ideally, if re-registering, show a message like "Registration started. New verification email sent."* 
6.  **User Clicks Link:** User opens the email and clicks the verification link.
7.  **Verification Endpoint Hit:** The link directs the browser to the Supabase verification endpoint, consuming the OTP.
8.  **Redirect to App:** Supabase redirects the user back to the application's configured redirect URL (e.g., `/verify-email` or `/`).
9.  **App Handles Auth Change:** The global `onAuthStateChange` listener (`UserManagementClientBoundary.tsx`) detects the authenticated session.
10. **Email Confirmed:** The user's `email_confirmed_at` field is updated in `auth.users`.
11. **User Logged In:** The user is now logged in and can access protected routes.
12. **(Optional) Resend:** If the user doesn't receive the email, they can trigger a resend from `/check-email` or `/verify-email`, which calls the `/api/auth/send-verification-email` endpoint.

## 2. Observed Failure Points & Symptoms

The current flow is failing at multiple points:

**(A) Form Submission Failure (Blocker #1)**
*   **Symptom:** Clicking "Register" on `RegistrationForm.tsx` resulted in runtime errors or failed validation, preventing the `signUp` call.
*   **Status:** <span style="color:green; font-weight:bold;">RESOLVED</span>
*   **Diagnosis:** Resolved through iterative debugging including adding logs, fixing store type issues, investigating component state (`isValid`), and ensuring validation logic was correctly handled by `react-hook-form`.

**(B) Initial Email Delivery Failure (Blocker #2)**
*   **Symptom:** Even when the form submission worked, the initial verification email was not received.
*   **Status:** <span style="color:green; font-weight:bold;">RESOLVED</span>
*   **Diagnosis:** Root cause was likely the use of the Supabase service role key for `signUp` calls in the backend API route. Refactoring to use the client-side `supabase.auth.signUp` (with the anon key) resolved the issue, aligning with standard Supabase verification flows.

**(C) Verification Link Failure (`otp_expired` or similar)**
*   **Symptom:** Clicking the verification link in the email redirects back to the application, but the user's email is not marked as confirmed in Supabase, and no verification success/error is logged in Supabase Auth logs.
*   **Status:** <span style="color:orange; font-weight:bold;">Under Investigation (SendGrid Interference Likely)</span>
*   **Diagnosis:** The verification emails are being sent via SendGrid, which wraps the actual Supabase verification link in a click-tracking URL. This intermediate step appears to be preventing the Supabase verification endpoint from being hit correctly, potentially due to the token being consumed/invalidated by the redirection or by email scanners interacting with the SendGrid link. The original `otp_expired` error might have been masked by this redirection behavior.

**(D) Resend Email Delivery Failure (Observed during diagnosis)**
*   **Symptom:** While the API call to `/api/auth/send-verification-email` returned 200 OK, the resent email was not reliably received initially.
*   **Status:** <span style="color:orange;">Likely Resolved (Needs Confirmation)</span>
*   **Diagnosis:** The API route uses the service key `auth.resend`. While manual testing confirmed the *initial* email (via client-side `signUp`) now works, the resend flow hasn't been explicitly re-tested end-to-end. It's probable that correcting the client-side configuration issues indirectly resolved any connection problems affecting the resend API, but confirmation requires testing the resend scenario specifically.

## 3. Systematic Resolution Plan

We must address these issues sequentially, starting with the most immediate blocker.

**Step 1: Resolve Form Submission Error (Failure Point A)**
*   **Goal:** Make the registration form successfully trigger the client-side `supabase.auth.signUp` call without runtime errors.
*   **Actions:**
    1.  **Verify Code Execution:** Add explicit `console.log` statements immediately before and after the `setIsSubmitting(true)` call (line 117 in `RegistrationForm.tsx`) and within the `onSubmit` handler to confirm execution flow.
    2.  **Clean Environment:** Advise user to:
        *   Ensure the file `RegistrationForm.tsx` is saved.
        *   Stop the Next.js development server.
        *   Delete the `.next` directory.
        *   Delete `node_modules` and reinstall (`npm install` or `yarn install`).
        *   Restart the development server (`npm run dev` or `yarn dev`).
        *   Clear browser cache thoroughly.
    3.  **Isolate State:** Temporarily comment out the `setIsSubmitting(true)` and `

## 4. Outstanding Tasks
*   **Disable SendGrid Click Tracking:** The primary suspected cause of verification failure. Disable this in SendGrid settings for auth emails and re-test.
*   Confirm Resend Email functionality works reliably end-to-end after resolving the SendGrid issue.
*   Add UI feedback (e.g., toast notification) upon successful email verification (handled in `UserManagementClientBoundary`).
*   Enhance integration/E2E tests to cover verification link click and post-verification state changes (complex, may require specific test strategy).