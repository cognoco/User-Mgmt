# User To-Do List

This file tracks items requiring user action or configuration.

1.  **Google Maps API Key for Address Validation:**
    *   **Task:** Obtain a Google Cloud API Key.
    *   **Enable API:** Ensure the "Address Validation API" is enabled for this key in your Google Cloud project.
    *   **Set Environment Variable:** Set the obtained API key as the `GOOGLE_MAPS_API_KEY` environment variable for the backend application.
    *   **Reason:** Required for the Address Validation feature (Item 3.5) implemented in `app/api/address/validate/route.ts`.

2.  **OAuth Provider Setup for Social Login/Registration:**
    *   **Task:** Obtain OAuth client IDs for Google and Apple sign-in.
    *   **Set Environment Variables:**
        - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (required)
        - `NEXT_PUBLIC_APPLE_CLIENT_ID` (required)
        - `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` (optional, defaults to your app's `/auth/callback`)
        - `NEXT_PUBLIC_APPLE_REDIRECT_URI` (optional, defaults to your app's `/auth/callback`)
    *   **Where:** Add these to your `.env` file or deployment environment.
    *   **Reason:** Required for social login/registration buttons to appear and function in the login and registration forms.

3.  **GitHub OAuth Setup for Social Login/Registration:**
    *   **Task:** Obtain a GitHub OAuth client ID for GitHub sign-in.
    *   **Set Environment Variables:**
        - `NEXT_PUBLIC_GITHUB_CLIENT_ID` (required)
        - `NEXT_PUBLIC_GITHUB_REDIRECT_URI` (optional, defaults to your app's `/auth/callback`)
    *   **Where:** Add these to your `.env` file or deployment environment.
    *   **Reason:** Required for the GitHub login button to appear and function in the login and registration forms.

4.  **Google OAuth Setup for E2E Connected Accounts Testing:**
    *   **Task:** Obtain a Google OAuth client ID and secret specifically for E2E testing (can be a separate test project in Google Cloud).
    *   **Set Environment Variables:**
        - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (required for E2E test to run the UI flow)
        - `NEXT_PUBLIC_GOOGLE_CLIENT_SECRET` (required for backend OAuth exchange, if applicable)
        - `NEXT_PUBLIC_GOOGLE_REDIRECT_URI` (should match your test app's `/auth/callback` or equivalent)
    *   **Where:** Add these to your `.env` file or deployment environment for E2E testing.
    *   **Reason:** Required for the E2E test to perform the full Google OAuth linking flow in Connected Accounts. Without these, the E2E test will only be a placeholder and cannot complete the OAuth flow.

*Add other user-specific tasks or configuration reminders here.* 