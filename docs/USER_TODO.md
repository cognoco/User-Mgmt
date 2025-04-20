# User To-Do List

This file tracks items requiring user action or configuration.

1.  **Google Maps API Key for Address Validation:**
    *   **Task:** Obtain a Google Cloud API Key.
    *   **Enable API:** Ensure the "Address Validation API" is enabled for this key in your Google Cloud project.
    *   **Set Environment Variable:** Set the obtained API key as the `GOOGLE_MAPS_API_KEY` environment variable for the backend application.
    *   **Reason:** Required for the Address Validation feature (Item 3.5) implemented in `app/api/address/validate/route.ts`.

*Add other user-specific tasks or configuration reminders here.* 