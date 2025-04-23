# Manual Verification Checklist

This document tracks the manual verification of the User Management System features against the requirements and expected behavior, and correlates it with automated test coverage.

**Instructions:**
1.  Run the application locally (`npm run dev`).
2.  Follow each `Verification Step` below.
3.  Record the `Actual Result` observed in the browser.
4.  Set the `Status` (Pass, Fail, Implemented, Not Implemented, Bug).
5.  Add any relevant details or screenshots to the `Notes / Screenshot` column.
6.  Review the `Existing Automated Tests` and `Missing Automated Tests` columns to identify coverage gaps.

---

## Registration Flow

| Flow / Screen / Component | Verification Step                     | Expected Result                                                                    | Actual Result | Status | Notes / Screenshot | Existing Automated Tests                                    | Missing Automated Tests                                                                 |
| :------------------------ | :------------------------------------ | :--------------------------------------------------------------------------------- | :------------ | :----- | :----------------- | :---------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| **Entry Point**           |                                       |                                                                                    |               |        |                    |                                                             |                                                                                         |
| Home Page (`/`)           | Click "Get Started" button (if present) | User is prompted to select user type (Private/Business) OR redirected to `/register`. | No automated test found. Button present in code. Manual check required. | Not Implemented | No E2E or integration test covers this. Needs E2E test for button click & redirect/prompt. | None | E2E test: Navigate to `/`, click "Get Started", verify redirect/prompt.                 |
| Direct Navigation       | Navigate to `/register` URL           | Registration form page loads successfully.                                         | Integration test renders form directly, not via navigation. Manual check required. | Partial | Integration test covers form, not route navigation. | `RegistrationForm.integration.test.tsx` (covers form, not navigation) | E2E test: Directly navigate to `/register`, verify page load and essential elements. |
| **Registration Form UI**  |                                       |                                                                                    |               |        |                    |                                                             |                                                                                         |
| `RegisterForm` Component  | Verify page title                     | Title "Create Your Account" (or similar) is displayed clearly.                   | Title is present in component. No test asserts it. Manual check required. | Not Implemented | Integration test should assert title. Visual regression missing. | `RegistrationForm.integration.test.tsx` (does not assert title) | Visual Regression Test for overall layout.                                              |
| `RegisterForm` Component  | Check Email field presence            | Input field for "Email *" is visible with a placeholder (e.g., "email@example.com"). | Field present, placeholder correct, tested by test ID. | Implemented | Integration test covers field presence and validation. | `RegistrationForm.integration.test.tsx` | Check for placeholder text specifically.                                                |
| `RegisterForm` Component  | Check First Name field presence       | Input field for "First Name *" is visible.                                         | Field present, tested by test ID. | Implemented | Integration test covers field presence and validation. | `RegistrationForm.integration.test.tsx` | Visual Regression Test for layout.                                                      |
| `RegisterForm` Component  | Check Last Name field presence        | Input field for "Last Name *" is visible.                                          | Field present, tested by test ID. | Implemented | Integration test covers field presence and validation. | `RegistrationForm.integration.test.tsx` | Visual Regression Test for layout.                                                      |
| `RegisterForm` Component  | Check Password field presence         | Input field for "Password *" (type=password) is visible.                           | Field present, tested by test ID. | Implemented | Integration test covers field presence and validation. | `RegistrationForm.integration.test.tsx` | Visual Regression Test for layout.                                                      |
| `RegisterForm` Component  | Check Confirm Password field presence | Input field for "Confirm Password *" (type=password) is visible.                 | Field present, tested by test ID. | Implemented | Integration test covers field presence and validation. | `RegistrationForm.integration.test.tsx` | Visual Regression Test for layout.                                                      |
| `RegisterForm` Component  | Check Password requirements display   | Initial helper text below Password field clearly lists all requirements (length, uppercase, lowercase, number, special character). | Not implemented. Skipped in test. | Not Implemented | Password requirements helper not present in DOM. | None | Test that specifically verifies the *exact* content and requirements listed in the helper text. |
| `RegisterForm` Component  | Check Terms checkbox presence         | Checkbox labeled "I agree to the..." is visible.                                   | Checkbox present, tested by test ID. | Implemented | Integration test covers checkbox presence and validation. | `RegistrationForm.integration.test.tsx` | Visual Regression Test for layout.                                                      |
| `RegisterForm` Component  | Check Terms link text/spacing       | Text reads "I agree to the [Terms and Conditions link] and [Privacy Policy link]." with correct spacing. | Text and links present, but not specifically tested. | Partial | Manual check required for exact text and spacing. | `RegistrationForm.integration.test.tsx` (might check for link presence) | Test verifying the *exact* text content and spacing of the label containing the links. |
| `RegisterForm` Component  | Check "Create Account" button         | Button labeled "Create Account" is visible and initially enabled or disabled based on form state. | Button present, tested by test ID. Disabled state tested. | Implemented | Integration test covers button presence and disabled state. | `RegistrationForm.integration.test.tsx` | Test verifying initial disabled state specifically.                                     |
| `RegisterForm` Component  | Check "Sign in" link presence       | Text "Already have an account? [Sign in link]" is visible.                         | Text and link present, tested for duplicates. | Implemented | Integration test checks for single instance. | `RegistrationForm.integration.test.tsx` | Test verifying the exact text and link destination.                                    |
| `RegisterForm` Component  | Check for duplicate elements        | Ensure elements like the "Sign in" link are not displayed multiple times.          | No duplicates, tested. | Implemented | Integration test checks for duplicates. | `RegistrationForm.integration.test.tsx` | Test that queries for the "Sign in" link/text and asserts it appears only once. Visual Regression Test. |
| `RegisterForm` Component  | Register with Google/Apple (social login) | Buttons for 'Register with Google' and 'Register with Apple' are visible and functional on the registration page. | OAuth config is now set in UserManagementClientBoundary, so buttons will render if env vars are set. | Implemented (pending verification in production) | OAuth config set in UserManagementClientBoundary. | None | E2E/integration test: Verify button rendering and social registration flow. |
| **Registration Form Validation (Client-side)** |                       |                                                                                    |               |        |                    |                                                             |                                                                                         |
| `RegisterForm` Component  | Submit empty form                   | Validation errors appear below each required field. Button remains disabled or doesn't submit. | Covered by integration test. Validation errors shown for all required fields. | Implemented | Integration test checks for all required field errors and button state. | `RegistrationForm.integration.test.tsx` | Verify specific error messages for each field. |
| `RegisterForm` Component  | Enter invalid email format          | Validation error appears below the Email field.                                    | Covered by integration test. Error message shown for invalid email. | Implemented | Integration test checks for invalid email error. | `RegistrationForm.integration.test.tsx` | Verify specific error message. |
| `RegisterForm` Component  | Enter password < 8 chars            | Validation error below Password field updates to reflect length requirement fail.    | Covered by integration test. Error message shown for short password. | Implemented | Integration test checks for password length error. | `RegistrationForm.integration.test.tsx` | Test *each* password rule violation individually and check specific error message/indicator update. |
| `RegisterForm` Component  | Enter password without uppercase    | Validation error below Password field updates to reflect uppercase requirement fail. | Covered by integration test. Error message shown for missing uppercase. | Implemented | Integration test checks for uppercase requirement. | `RegistrationForm.integration.test.tsx` | Test *each* password rule violation individually and check specific error message/indicator update. |
| `RegisterForm` Component  | Enter password without lowercase    | Validation error below Password field updates to reflect lowercase requirement fail. | Covered by integration test. Error message shown for missing lowercase. | Implemented | Integration test checks for lowercase requirement. | `RegistrationForm.integration.test.tsx` | Test *each* password rule violation individually and check specific error message/indicator update. |
| `RegisterForm` Component  | Enter password without number       | Validation error below Password field updates to reflect number requirement fail.    | Covered by integration test. Error message shown for missing number. | Implemented | Integration test checks for number requirement. | `RegistrationForm.integration.test.tsx` | Test *each* password rule violation individually and check specific error message/indicator update. |
| `RegisterForm` Component  | Enter password without special char | Validation error below Password field updates to reflect special char requirement fail. | Not implemented. No validation or test for special character. | Not Implemented | Password requirements do not include special character in schema or test. | None | Test *each* password rule violation individually and check specific error message/indicator update. |
| `RegisterForm` Component  | Enter mismatching passwords         | Validation error appears below the Confirm Password field.                           | Covered by integration test. Error message shown for mismatched passwords. | Implemented | Integration test checks for password match error. | `RegistrationForm.integration.test.tsx` | Verify specific error message. |
| `RegisterForm` Component  | Do not check "Terms" box            | Validation error appears below the checkbox.                                       | Covered by integration test. Error message shown for unchecked terms. | Implemented | Integration test checks for terms acceptance error. | `RegistrationForm.integration.test.tsx` | Verify specific error message. |
| **Registration Form Submission** |                       |                                                                                    |               |        |                    |                                                             |                                                                                         |
| `RegisterForm` Component  | Fill valid data & submit            | Form submits, success message/redirect, or email verification prompt appears. No errors. | Covered by integration test. Success message and redirect tested. | Implemented | Integration test checks for successful submission and redirect. | `RegistrationForm.integration.test.tsx` | E2E test simulating full submission and checking subsequent state/page/message.       |
| Email Client              | Check inbox after registration      | Receive verification email with a clickable link/button.                           | No automated test. Manual check required. | Not Implemented | No E2E or integration test for email delivery. Requires email testing service. | None | E2E test using a tool like MailHog/Mailosaur to intercept and check email content/links. |
| Verification Link         | Click verification link in email    | User is redirected to the app, account is marked verified, user possibly logged in or prompted to log in. | No automated test. Manual check required. | Not Implemented | No E2E or integration test for verification link. Requires email testing service. | None | E2E test: Extract link from email (via tool), visit link, verify outcome (redirect, DB status, UI). |

---

## Business Registration Flow

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to `/register` and select "Business" user type | Company information fields become visible in the registration form. | Covered by integration test. Company fields appear when Business is selected. | Implemented | Integration test covers user type selection and field visibility. | `RegistrationForm.integration.test.tsx` | E2E test: Navigate to `/register`, select Business, verify company fields appear. |
| Company Name Field | Check presence and required validation | "Company Name *" input is visible and required for Business users. | Covered by integration test. Field present and required. | Implemented | Integration test covers required validation for company name. | `RegistrationForm.integration.test.tsx` | Visual Regression Test for layout. |
| Position Field | Check presence | "Position" input is visible for Business users. | Covered by integration test. Field present. | Implemented | Integration test covers field presence. | `RegistrationForm.integration.test.tsx` | Visual Regression Test for layout. |
| Industry Field | Check presence | "Industry" input is visible for Business users. | Covered by integration test. Field present. | Implemented | Integration test covers field presence. | `RegistrationForm.integration.test.tsx` | Visual Regression Test for layout. |
| Company Size Field | Check presence | "Company Size" select is visible for Business users. | Covered by integration test. Field present. | Implemented | Integration test covers field presence. | `RegistrationForm.integration.test.tsx` | Visual Regression Test for layout. |
| Validation | Submit with missing required company info | Validation error appears for missing "Company Name". | Covered by integration test. Error shown for missing company name. | Implemented | Integration test covers required validation for company name. | `RegistrationForm.integration.test.tsx` | Test for each required field error message. |
| Switch User Type | Switch from Business to Personal and back | Company fields reset/clear when switching user type. | Covered by integration test. Fields reset/clear as expected. | Implemented | Integration test covers field reset on user type switch. | `RegistrationForm.integration.test.tsx` | E2E test: Switch user types, verify field reset. |
| Submission | Fill all fields and submit | Form submits, success message/redirect, or email verification prompt appears. | Covered by integration test. Success message and redirect tested. | Implemented | Integration test covers successful submission and redirect. | `RegistrationForm.integration.test.tsx` | E2E test: Full business registration flow, check subsequent state/page/message. |

---

## Login Flow

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to `/login` | Login form page loads successfully. | Covered by integration and unit tests. Form renders as expected. | Implemented | LoginForm.test.tsx and user-auth-flow.test.tsx cover form render. | `LoginForm.test.tsx`, `user-auth-flow.test.tsx` | E2E test: Navigate to `/login`, verify page load and essential elements. |
| Email Field | Check presence and validation | "Email" input is visible and required. | Covered by integration and unit tests. Field present and validated. | Implemented | LoginForm.test.tsx covers field presence and validation. | `LoginForm.test.tsx` | Visual Regression Test for layout. |
| Password Field | Check presence and validation | "Password" input is visible and required. | Covered by integration and unit tests. Field present and validated. | Implemented | LoginForm.test.tsx covers field presence and validation. | `LoginForm.test.tsx` | Visual Regression Test for layout. |
| Submit Empty Form | Submit with empty fields | Validation errors appear for required fields. | Covered by integration and unit tests. Validation errors shown. | Implemented | LoginForm.test.tsx covers validation. | `LoginForm.test.tsx` | Test for specific error messages. |
| Invalid Credentials | Submit with invalid credentials | Error message appears for invalid login. | Covered by integration and unit tests. Error message shown. | Implemented | LoginForm.test.tsx covers error handling. | `LoginForm.test.tsx` | E2E test: Simulate invalid login, check error. |
| Successful Login | Submit with valid credentials | User is logged in and redirected to dashboard/home. | Covered by integration and unit tests. Redirect and state tested. | Implemented | user-auth-flow.test.tsx covers successful login and redirect. | `user-auth-flow.test.tsx` | E2E test: Simulate valid login, check redirect and state. |
| LoginForm Component | Sign in with Google/Apple (social login) | Buttons for 'Sign in with Google' and 'Sign in with Apple' are visible and functional on the login page. | OAuth config is now set in UserManagementClientBoundary, so buttons will render if env vars are set. | Implemented (pending verification in production) | OAuth config set in UserManagementClientBoundary. | None | E2E/integration test: Verify button rendering and social login flow. |
| Login Flow | Log in with valid/invalid credentials | User can log in with valid credentials, error shown for invalid. | E2E test for login (valid/invalid credentials) is implemented in /e2e/auth/login.e2e.test.ts. | Implemented | E2E test covers login and error. | `/e2e/auth/login.e2e.test.ts` |  |
| Password Recovery Flow | Request password reset, reset via link | User can request password reset, receives email, can reset via link. | E2E test for password recovery (request with valid/invalid email) is implemented in /e2e/auth/password-recovery.e2e.test.ts. Placeholder for reset via email link is present. | Implemented | E2E test covers request; reset via link to be expanded. | `/e2e/auth/password-recovery.e2e.test.ts` |  |
| Email Verification Flow | Register, verify email via link | User sees verification prompt after registration, can verify via link. | E2E test for email verification prompt after registration is implemented in /e2e/auth/email-verification.e2e.test.ts. Placeholder for verify via email link is present. | Implemented | E2E test covers prompt; verify via link to be expanded. | `/e2e/auth/email-verification.e2e.test.ts` |  |

---

## Profile Flow

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to `/profile` (or user menu) | Profile page loads, showing user info. | Covered by integration test. ProfileEditor renders and loads user info. | Implemented | user-auth-flow.test.tsx covers profile load. | `user-auth-flow.test.tsx` | E2E test: Navigate to `/profile`, verify page load and essential elements. |
| Edit Fields | Edit profile fields | Fields are editable, changes are reflected in UI. | Covered by integration test. Fields editable and update reflected. | Implemented | user-auth-flow.test.tsx covers field editing. | `user-auth-flow.test.tsx` | Visual Regression Test for layout. |
| Avatar Upload | Upload/change profile picture | Avatar upload works, preview is shown. | Covered by unit test. Avatar upload and preview tested. | Implemented | CompanyLogoUpload.test.tsx covers avatar upload. | `CompanyLogoUpload.test.tsx` | E2E test: Simulate avatar upload, check preview and save. |
| Save Changes | Submit updated profile | Success message shown, changes saved. | Covered by integration test. Success message and update tested. | Implemented | user-auth-flow.test.tsx covers save. | `user-auth-flow.test.tsx` | E2E test: Simulate profile update, check persistence. |
| Privacy Settings | Change privacy options | Privacy settings can be toggled and saved. | Not directly covered. | Not Implemented | No direct test for privacy settings toggle. | None | E2E test: Simulate privacy toggle, check persistence. |
| ProfileEditor/ProfileForm Component | Connected Accounts (Account Linking UI) | 'Connected Accounts' section is visible and functional in the profile page/editor. Users can link/unlink OAuth providers from their profile. | ConnectedAccounts component is now rendered in the profile page/editor. Integration tests for linking/unlinking are implemented. | Implemented | Account linking UI available in profile. Integration tests for linking/unlinking present. E2E tests still missing. | `ProfileEditor.test.tsx` | E2E test: Add for profile account linking. |
| Profile Update Flow | Update profile info, upload avatar, toggle privacy | User can update profile info, upload avatar, and toggle privacy settings. | E2E test for profile info update is implemented in /e2e/profile-update.e2e.test.ts. Placeholders for avatar upload and privacy toggle are present. | Implemented | E2E test covers info update; avatar/privacy to be expanded. | `/e2e/profile-update.e2e.test.ts` |  |

---

## Settings Flow

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to `/settings` (or user menu) | Settings page loads, showing tabs/options. | Covered by integration tests. Settings and preferences load. | Implemented | user-preferences-flow.test.tsx, theme-settings-flow.test.tsx, notification-flow.test.tsx cover settings. | `user-preferences-flow.test.tsx`, `theme-settings-flow.test.tsx`, `notification-flow.test.tsx` | E2E test: Navigate to `/settings`, verify page load and essential elements. |
| General Tab | Edit general settings | General settings can be edited and saved. | Covered by integration test. General settings editable and saved. | Implemented | user-preferences-flow.test.tsx covers general tab. | `user-preferences-flow.test.tsx` | Visual Regression Test for layout. |
| Notifications Tab | Edit notification preferences | Notification settings can be toggled and saved. | Covered by integration test. Notification preferences toggled and saved. | Implemented | notification-flow.test.tsx covers notifications tab. | `notification-flow.test.tsx` | E2E test: Simulate notification toggle, check persistence. |
| Privacy Tab | Edit privacy settings | Privacy settings can be toggled and saved. | Not directly covered. | Not Implemented | No direct test for privacy settings toggle. | None | E2E test: Simulate privacy toggle, check persistence. |
| Theme Toggle | Change theme (light/dark) | Theme can be toggled and persists. | Covered by integration test. Theme toggle and persistence tested. | Implemented | theme-settings-flow.test.tsx covers theme toggle. | `theme-settings-flow.test.tsx` | E2E test: Simulate theme toggle, check persistence. |
| SettingsPanel Component | Connected Accounts (Account Linking UI) | 'Connected Accounts' section is visible and functional under the 'accounts' tab in settings. Users can link/unlink OAuth providers. | ConnectedAccounts component is rendered in the 'accounts' tab of SettingsPanel. UI is accessible to end users. | Implemented | Confirmed in SettingsPanel.tsx. No E2E/integration test found for account linking UI. | None | Add E2E/integration test for linking/unlinking accounts from settings. |

---

## Password Recovery Flow

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to `/forgot-password` | Password recovery form loads. | Covered by integration test. ResetPasswordForm renders. | Implemented | password-reset-flow.test.tsx covers form render. | `password-reset-flow.test.tsx` | E2E test: Navigate to `/forgot-password`, verify page load and essential elements. |
| Email Field | Check presence and validation | "Email" input is visible and required. | Covered by integration test. Field present and validated. | Implemented | password-reset-flow.test.tsx covers field presence and validation. | `password-reset-flow.test.tsx` | Visual Regression Test for layout. |
| Submit Empty Form | Submit with empty field | Validation error appears for required email. | Covered by integration test. Validation error shown. | Implemented | password-reset-flow.test.tsx covers validation. | `password-reset-flow.test.tsx` | Test for specific error message. |
| Submit Valid Email | Submit with valid email | Success message shown, password reset email sent. | Covered by integration test. Success message and email sent tested. | Implemented | password-reset-flow.test.tsx covers success. | `password-reset-flow.test.tsx` | E2E test: Simulate password reset, check email delivery. |
| Reset Link | Click password reset link in email | User is redirected to reset form, can set new password. | Covered by integration test. Reset form shown and new password can be set. | Implemented | password-reset-flow.test.tsx covers reset link and new password. | `password-reset-flow.test.tsx` | E2E test: Intercept email, visit reset link, check flow. |
| Set New Password | Submit new password | Success message shown, user can log in with new password. | Covered by integration test. Success message and login tested. | Implemented | password-reset-flow.test.tsx covers new password. | `password-reset-flow.test.tsx` | E2E test: Simulate full reset, check login. |

---

## Multi-Factor Authentication (MFA) Flow

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to MFA setup page or settings | MFA setup wizard loads, showing available methods. | Covered by integration test. MFA setup wizard loads and shows methods. | Implemented | user-auth-flow.test.tsx covers MFA setup entry. | `user-auth-flow.test.tsx` | E2E test: Navigate to MFA setup, verify wizard and method options. |
| Setup MFA | Start setup for TOTP/SMS/email | QR code or code input is shown, user can scan or enter code. | Covered by integration test. TOTP setup and QR/code display tested. | Implemented | user-auth-flow.test.tsx covers TOTP setup. | `user-auth-flow.test.tsx` | E2E test: Simulate setup, check QR/code display. |
| Verify MFA | Enter code to verify setup | Correct code enables MFA, error for invalid code. | Covered by integration test. Code entry and verification tested. | Implemented | user-auth-flow.test.tsx covers verification. | `user-auth-flow.test.tsx` | E2E test: Simulate code entry, check success/error. |
| Backup Codes | View/download backup codes | Backup codes are generated and can be saved. | Covered by integration test. Backup codes generated and shown. | Implemented | user-auth-flow.test.tsx covers backup codes. | `user-auth-flow.test.tsx` | E2E test: Simulate viewing/downloading codes. |
| Disable MFA | Disable MFA from settings | MFA is disabled, confirmation shown. | Covered by integration test. Disable and confirmation tested. | Implemented | user-auth-flow.test.tsx covers disable. | `user-auth-flow.test.tsx` | E2E test: Simulate disabling MFA, check state. |
| Error Handling | Enter invalid code or fail setup | Error message shown, cannot proceed. | Covered by integration test. Error handling tested. | Implemented | user-auth-flow.test.tsx covers error handling. | `user-auth-flow.test.tsx` | E2E test: Simulate error, check message. |

---

## Account Deletion Flow

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to account deletion page or settings | Account deletion option is visible and accessible. | Covered by integration test. Deletion option visible in settings. | Implemented | user-auth-flow.test.tsx covers deletion entry. | `user-auth-flow.test.tsx` | E2E test: Navigate to deletion, verify option visibility. |
| Confirmation | Initiate account deletion | Confirmation dialog/modal appears, user must confirm. | Covered by integration test. Confirmation dialog/modal shown. | Implemented | user-auth-flow.test.tsx covers confirmation. | `user-auth-flow.test.tsx` | E2E test: Simulate confirmation dialog/modal. |
| Password Verification | Enter password to confirm deletion | User must enter password to proceed. Error for incorrect password. | Covered by integration test. Password entry and error tested. | Implemented | user-auth-flow.test.tsx covers password check. | `user-auth-flow.test.tsx` | E2E test: Simulate password entry, check error/success. |
| Deletion | Confirm and delete account | Account is deleted, user is logged out and redirected. | Covered by integration test. Deletion, logout, and redirect tested. | Implemented | user-auth-flow.test.tsx covers deletion and redirect. | `user-auth-flow.test.tsx` | E2E test: Simulate deletion, check logout and redirect. |
| Error Handling | Fail deletion (e.g., wrong password, server error) | Error message shown, account not deleted. | Covered by integration test. Error handling tested. | Implemented | user-auth-flow.test.tsx covers error handling. | `user-auth-flow.test.tsx` | E2E test: Simulate error, check message. |

---

## Data Export Flow

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to data export page or settings | Data export option is visible and accessible. | Covered by integration test. Export option visible in settings. | Implemented | user-auth-flow.test.tsx covers export entry. | `user-auth-flow.test.tsx` | E2E test: Navigate to export, verify option visibility. |
| Export Options | View available export options | User can select data types to export (profile, activity, etc.). | Covered by integration test. Options selectable. | Implemented | user-auth-flow.test.tsx covers export options. | `user-auth-flow.test.tsx` | E2E test: Simulate option selection. |
| Format Selection | Select export format (CSV, JSON, etc.) | User can select export format. | Covered by integration test. Format selection tested. | Implemented | user-auth-flow.test.tsx covers format selection. | `user-auth-flow.test.tsx` | E2E test: Simulate format selection. |
| Export Action | Initiate export | Export is processed, user receives download link or file. | Covered by integration test. Export action and download link tested. | Implemented | user-auth-flow.test.tsx covers export action. | `user-auth-flow.test.tsx` | E2E test: Simulate export, check download. |
| Download | Download exported data | File is downloaded in selected format, data is correct. | Covered by integration test. Download tested. | Implemented | user-auth-flow.test.tsx covers download. | `user-auth-flow.test.tsx` | E2E test: Simulate download, verify file. |
| Error Handling | Fail export (e.g., server error) | Error message shown, export not completed. | Covered by integration test. Error handling tested. | Implemented | user-auth-flow.test.tsx covers error handling. | `user-auth-flow.test.tsx` | E2E test: Simulate error, check message. |

---

## Subscription Management Flow

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to subscription page or settings | Subscription management option is visible and accessible. | Covered by integration test. Subscription option visible in settings. | Implemented | user-auth-flow.test.tsx covers subscription entry. | `user-auth-flow.test.tsx` | E2E test: Navigate to subscription, verify option visibility. |
| View Plans | View available subscription plans | User can view all available plans and features. | Covered by integration test. Plans and features viewable. | Implemented | user-auth-flow.test.tsx covers plan view. | `user-auth-flow.test.tsx` | E2E test: Simulate plan view. |
| Select/Upgrade/Downgrade Plan | Select a plan or change current plan | User can select, upgrade, or downgrade plan. | Covered by integration test. Plan selection and change tested. | Implemented | user-auth-flow.test.tsx covers plan selection. | `user-auth-flow.test.tsx` | E2E test: Simulate plan change. |
| Payment | Enter payment details and confirm | Payment form is shown, user can enter details and confirm. | Covered by integration test. Payment form and confirmation tested. | Implemented | user-auth-flow.test.tsx covers payment. | `user-auth-flow.test.tsx` | E2E test: Simulate payment, check confirmation. |
| Confirmation | Receive confirmation of plan change | Confirmation message shown, plan updated. | Covered by integration test. Confirmation and plan update tested. | Implemented | user-auth-flow.test.tsx covers confirmation. | `user-auth-flow.test.tsx` | E2E test: Simulate confirmation, check state. |
| Error Handling | Fail plan change or payment | Error message shown, plan not changed. | Covered by integration test. Error handling tested. | Implemented | user-auth-flow.test.tsx covers error handling. | `user-auth-flow.test.tsx` | E2E test: Simulate error, check message. |

---

## Payment Provider Integration Flow

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to payment method page or during subscription | Payment provider options are visible and accessible. | Covered by integration test. Payment provider options visible. | Implemented | user-auth-flow.test.tsx covers payment entry. | `user-auth-flow.test.tsx` | E2E test: Navigate to payment, verify provider options. |
| Add Payment Method | Add a new payment method | User can add a new card or payment method. | Covered by integration test. Add method tested. | Implemented | user-auth-flow.test.tsx covers add method. | `user-auth-flow.test.tsx` | E2E test: Simulate adding payment method. |
| Remove Payment Method | Remove an existing payment method | User can remove a payment method. | Covered by integration test. Remove method tested. | Implemented | user-auth-flow.test.tsx covers remove method. | `user-auth-flow.test.tsx` | E2E test: Simulate removing payment method. |
| Set Default Payment Method | Set a payment method as default | User can set a payment method as default. | Covered by integration test. Set default tested. | Implemented | user-auth-flow.test.tsx covers set default. | `user-auth-flow.test.tsx` | E2E test: Simulate setting default method. |
| Payment Action | Make a payment or complete subscription | Payment is processed, confirmation shown. | Covered by integration test. Payment and confirmation tested. | Implemented | user-auth-flow.test.tsx covers payment action. | `user-auth-flow.test.tsx` | E2E test: Simulate payment, check confirmation. |
| Error Handling | Fail payment or method action | Error message shown, payment not completed. | Covered by integration test. Error handling tested. | Implemented | user-auth-flow.test.tsx covers error handling. | `user-auth-flow.test.tsx` | E2E test: Simulate error, check message. |

---

## Audit Logging Flow

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to audit logs page or admin panel | Audit logs are visible and accessible to authorized users. | No automated test. Manual/E2E check required. | Not Implemented | No test for audit log entry. | None | E2E test: Navigate to audit logs, verify visibility. |
| View Logs | View audit log entries | User/admin can view log entries with details. | No automated test. Manual/E2E check required. | Not Implemented | No test for viewing audit logs. | None | E2E test: Simulate viewing logs, check details. |
| Filter/Search Logs | Filter or search audit logs | User/admin can filter or search logs by criteria. | No automated test. Manual/E2E check required. | Not Implemented | No test for filtering/searching logs. | None | E2E test: Simulate filtering/searching logs. |
| Export Logs | Export audit logs | User/admin can export logs in supported formats. | No automated test. Manual/E2E check required. | Not Implemented | No test for exporting logs. | None | E2E test: Simulate export, verify file. |
| Error Handling | Fail to load or export logs | Error message shown, logs not loaded/exported. | No automated test. Manual/E2E check required. | Not Implemented | No test for error handling in audit logs. | None | E2E test: Simulate error, check message. |

---

## Activity Logging Flow

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to activity log page or user dashboard | Activity logs are visible and accessible to user. | No automated test. Manual/E2E check required. | Not Implemented | No test for activity log entry. | None | E2E test: Navigate to activity logs, verify visibility. |
| View Logs | View activity log entries | User can view their activity log entries with details. | No automated test. Manual/E2E check required. | Not Implemented | No test for viewing activity logs. | None | E2E test: Simulate viewing logs, check details. |
| Filter/Search Logs | Filter or search activity logs | User can filter or search logs by criteria. | No automated test. Manual/E2E check required. | Not Implemented | No test for filtering/searching logs. | None | E2E test: Simulate filtering/searching logs. |
| Export Logs | Export activity logs | User can export logs in supported formats. | No automated test. Manual/E2E check required. | Not Implemented | No test for exporting logs. | None | E2E test: Simulate export, verify file. |
| Error Handling | Fail to load or export logs | Error message shown, logs not loaded/exported. | No automated test. Manual/E2E check required. | Not Implemented | No test for error handling in activity logs. | None | E2E test: Simulate error, check message. |

---

## Onboarding / Setup Wizard Flow

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | New user logs in or is redirected to onboarding | Welcome screen or onboarding wizard is shown. | Covered by implementation. Onboarding wizard shown for new users. | Implemented | Onboarding/SetupWizard.tsx, WelcomeScreen.tsx, useOnboarding.ts. No automated test. | None | E2E test: New user login, verify onboarding shown. |
| Welcome Screen | View welcome and progress | Welcome message, progress bar, and steps are visible. | Covered by implementation. Welcome screen and progress bar shown. | Implemented | WelcomeScreen.tsx, ProgressTracker.tsx. No automated test. | None | E2E test: Verify welcome screen and progress. |
| Profile Completion | Complete profile step | User can fill in profile info, step is marked complete. | Covered by implementation. Profile step present in onboarding state. | Implemented | useOnboarding.ts, SetupWizard.tsx. No automated test. | None | E2E test: Complete profile, verify step completion. |
| Feature Tour | View feature tour steps | User can view and navigate feature tour steps. | Covered by implementation. FeatureTour.tsx present, steps navigable. | Implemented | FeatureTour.tsx. No automated test. | None | E2E test: Navigate feature tour, verify content. |
| Preferences Setup | Set preferences (theme, language, notifications) | User can set preferences, step is marked complete. | Covered by implementation. Preferences step present in SetupWizard.tsx. | Implemented | SetupWizard.tsx. No automated test. | None | E2E test: Set preferences, verify persistence. |
| Completion | Finish onboarding | Completion message shown, user is redirected to app/dashboard. | Covered by implementation. Completion step present in SetupWizard.tsx. | Implemented | SetupWizard.tsx. No automated test. | None | E2E test: Complete onboarding, verify redirect. |
| Skip/Reset | Skip or reset onboarding | User can skip or reset onboarding, state updates accordingly. | Covered by implementation. Skip/reset supported in useOnboarding.ts. | Implemented | useOnboarding.ts. No automated test. | None | E2E test: Skip/reset onboarding, verify state. |

---

## Business SSO Setup / Login Flow

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to SSO setup in org settings | SSO setup option is visible and accessible. | Covered by implementation. SSO setup option present in BusinessSSOSetup.tsx. | Implemented | BusinessSSOSetup.tsx, OrganizationSSO.tsx. No automated test. | None | E2E test: Navigate to SSO setup, verify option. |
| Enable SSO | Enable SSO and select provider | User can enable SSO and select SAML or OIDC. | Covered by implementation. Enable and select provider in BusinessSSOSetup.tsx. | Implemented | BusinessSSOSetup.tsx. No automated test. | None | E2E test: Enable SSO, select provider. |
| Configure IDP | Enter IDP configuration details | User can enter and save IDP config (entity ID, URLs, certs, etc.). | Covered by implementation. IDPConfiguration.tsx supports config entry. | Implemented | IDPConfiguration.tsx. No automated test. | None | E2E test: Enter/save IDP config, verify validation. |
| Save Settings | Save SSO settings | Settings are saved, confirmation shown. | Covered by implementation. Save and confirmation in BusinessSSOSetup.tsx. | Implemented | BusinessSSOSetup.tsx. No automated test. | None | E2E test: Save settings, verify confirmation. |
| SSO Login | Login via SSO from login page | User can select SSO login, is redirected to provider, and returns. | Covered by implementation. SSO login handled in OrganizationSSO.tsx. | Implemented | OrganizationSSO.tsx. No automated test. | None | E2E test: SSO login, verify redirect and state. |
| Link/Unlink Account | Link or unlink SSO account | User can link/unlink SSO account, state updates. | Covered by implementation. Link/unlink logic present. | Implemented | OrganizationSSO.tsx. No automated test. | None | E2E test: Link/unlink SSO, verify state. |
| Error Handling | Fail SSO setup or login | Error message shown, cannot proceed. | Covered by implementation. Error handling present in SSO components. | Implemented | BusinessSSOSetup.tsx, OrganizationSSO.tsx. No automated test. | None | E2E test: Simulate error, check message. |

---

## User Invitation & Team/Organization Management Flow (Lower Priority)

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to team/org management page | Team/org management option is visible and accessible. | Implemented. Team management UI and API present. | Implemented | See TeamManagement.tsx, TeamInviteDialog.tsx. No E2E test. | None | E2E test: Navigate to team/org management, verify option. |
| Invite User | Send invitation to user | User can send invite, invitee receives email. | Implemented. Invite dialog and API present. | Implemented | See TeamInviteDialog.tsx, useTeamInvite.ts, /api/team/invites. No E2E test. | None | E2E test: Send invite, check email delivery. |
| Accept Invitation | Accept invite and join team/org | Invitee can accept, join team/org, and see confirmation. | Implemented. Accept invite API and logic present. | Implemented | See /api/team/invites/accept. No E2E test. | None | E2E test: Accept invite, verify join. |
| Manage Members | View, remove, or change member roles | Admin can manage team/org members and roles. | Implemented. UI and API for member management present. | Implemented | See TeamManagement.tsx, /api/team/members. No E2E test. | None | E2E test: Manage members, verify changes. |
| Error Handling | Fail invite or join | Error message shown, cannot proceed. | Implemented. Error handling in API and UI. | Implemented | See TeamInviteDialog.tsx, /api/team/invites. No E2E test. | None | E2E test: Simulate error, check message. |

---

## Account Recovery Options Flow (Lower Priority)

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to account recovery page | Account recovery options are visible and accessible. | Not implemented. No code or UI for recovery options. | Not Implemented | Only standard password reset is present. | None | E2E test: Navigate to recovery, verify options. |
| Add Recovery Email/Phone | Add recovery contact | User can add recovery email/phone, confirmation sent. | Not implemented. | Not Implemented | No code for adding recovery contact. | None | E2E test: Add recovery contact, check confirmation. |
| Use Recovery Option | Recover account using recovery contact | User can recover account via recovery email/phone. | Not implemented. | Not Implemented | No code for using recovery contact. | None | E2E test: Use recovery option, verify flow. |
| Error Handling | Fail recovery | Error message shown, cannot proceed. | Not implemented. | Not Implemented | No code for error handling. | None | E2E test: Simulate error, check message. |

---

## Email Notification Preferences Flow (Lower Priority)

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to email notification settings | Email notification preferences are visible and accessible. | Implemented. NotificationPreferences.tsx and SettingsPanel.tsx present. | Implemented | UI and store logic for notification preferences. | notification-flow.test.tsx | E2E test: Navigate to email notification settings, verify options. |
| Toggle Preferences | Enable/disable specific email types | User can toggle marketing, transactional, etc. | Implemented. UI toggles and store logic present. | Implemented | See NotificationPreferences.tsx. | notification-flow.test.tsx | E2E test: Toggle preferences, verify persistence. |
| Save Preferences | Save email notification preferences | Preferences are saved, confirmation shown. | Implemented. Save logic and feedback present. | Implemented | See NotificationPreferences.tsx. | notification-flow.test.tsx | E2E test: Save preferences, verify confirmation. |
| Error Handling | Fail to save preferences | Error message shown, preferences not saved. | Implemented. Error handling in UI and test. | Implemented | See NotificationPreferences.tsx. | notification-flow.test.tsx | E2E test: Simulate error, check message. |

---

## Session Management Flow (Lower Priority)

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to session management page | Session management option is visible and accessible. | Not implemented for admin/multi-device. Only session timeout for current user. | Partially Implemented | See auth.store.ts for session timeout. No UI for session list/revoke. | None | E2E test: Navigate to session management, verify option. |
| View Sessions | View active sessions/devices | User can see all active sessions/devices. | Not implemented. | Not Implemented | No code for session/device listing. | None | E2E test: View sessions, verify list. |
| Revoke Session | Revoke a session/device | User can revoke a session/device, confirmation shown. | Not implemented. | Not Implemented | No code for revoking sessions. | None | E2E test: Revoke session, verify removal. |
| Error Handling | Fail to revoke session | Error message shown, session not revoked. | Not implemented. | Not Implemented | No code for error handling. | None | E2E test: Simulate error, check message. |
| Settings/Profile UI | Session/Device Management UI | Users can view and manage their active sessions/devices (e.g., session list, revoke session button). | No UI for session or device management is present in settings or profile. Users cannot view or revoke sessions/devices. | Not Implemented | No way for users to manage sessions/devices in the UI. | None | Add session/device management UI; E2E/integration test for session listing and revocation. |

---

## Profile Verification Flow (Lower Priority)

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to profile verification page | Profile verification option is visible and accessible. | Not implemented for user profile. Company/domain verification is present. | Partially Implemented | See DomainVerification.tsx for company verification. | None | E2E test: Navigate to verification, verify option. |
| Request Verification | Request profile verification | User can request verification, admin notified. | Not implemented for user profile. | Not Implemented | No code for user profile verification. | None | E2E test: Request verification, check admin notification. |
| Approve/Reject | Admin approves or rejects verification | Admin can approve/reject, user notified. | Not implemented for user profile. | Not Implemented | No code for user profile verification. | None | E2E test: Approve/reject, verify notification. |
| Error Handling | Fail verification | Error message shown, cannot proceed. | Not implemented for user profile. | Not Implemented | No code for user profile verification. | None | E2E test: Simulate error, check message. |
| Profile/Settings UI | User Profile Verification UI | Users can request, view, or manage verification of their individual profile (e.g., verified badge, request verification button). | UI for requesting and viewing user profile verification is now fully implemented, including document upload (toggleable) and admin feedback display. | Implemented | Integration and E2E tests are implemented and passing. | `ProfileVerification.test.tsx`, `/e2e/profile-verification.e2e.test.ts` |  |

---

## Role/Permission Management Flow (Lower Priority)

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to role/permission management page | Role/permission management option is visible and accessible. | Implemented (backend/store). No dedicated UI for admin. | Implemented | See rbac/roles.ts, rbac/roleService.ts, rbac.store.ts. | None | E2E test: Navigate to role/permission management, verify option. |
| Assign Role | Assign role to user | Admin can assign roles, user role updates. | Implemented (backend/store). No dedicated UI for admin. | Implemented | See rbac/roleService.ts, rbac.store.ts. | None | E2E test: Assign role, verify update. |
| Change Permissions | Change permissions for a role | Admin can change permissions, users updated. | Implemented (backend/store). No dedicated UI for admin. | Implemented | See rbac/roleService.ts, rbac.store.ts. | None | E2E test: Change permissions, verify update. |
| Error Handling | Fail to update role/permissions | Error message shown, update not completed. | Implemented (backend/store). | Implemented | See rbac/roleService.ts, rbac.store.ts. | None | E2E test: Simulate error, check message. |
| Admin/Settings/Profile UI | Role/Permission Management UI | Admins/users can view and manage roles/permissions through the UI. | User/role listing, assignment, and removal UI is now implemented in the admin panel. Permissions viewer, integration, and E2E tests are now implemented. | Implemented | E2E test in /e2e/admin/role-management.e2e.test.ts covers panel visibility, assigning/removing roles, viewing permissions, and has placeholders for error/loading/empty states. **Usage documentation is present as a docstring in RoleManagementPanel.tsx, supporting modularity and pluggability.** | `RoleManagementPanel.test.tsx`, `/e2e/admin/role-management.e2e.test.ts` |  |

---

## Corporate/Private User Switching Flow (Lower Priority)

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to user type switch page or settings | User type switch option is visible and accessible. | Implemented. UserType supported in schemas, registration, and profile. | Implemented | See user-type.ts, RegistrationForm.tsx, ProfileTypeConversion.tsx. | RegistrationForm.integration.test.tsx | E2E test: Navigate to user type switch, verify option. |
| Switch User Type | Switch between corporate and private | User can switch type, profile updates accordingly. | Implemented. ProfileTypeConversion.tsx present. | Implemented | See ProfileTypeConversion.tsx. | RegistrationForm.integration.test.tsx | E2E test: Switch user type, verify update. |
| Error Handling | Fail to switch user type | Error message shown, type not switched. | Implemented. Error handling in ProfileTypeConversion.tsx. | Implemented | See ProfileTypeConversion.tsx. | None | E2E test: Simulate error, check message. |

---

## Terms & Policy Updates Flow (Lower Priority)

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Terms/policy update is triggered | User is prompted to re-consent to updated terms/policy. | Not implemented. Only static links in registration. | Not Implemented | No dynamic consent or update flow. | None | E2E test: Trigger update, verify prompt. |
| Consent | User accepts updated terms/policy | User can accept, app records consent. | Not implemented. | Not Implemented | No code for consent tracking. | None | E2E test: Accept terms, verify consent. |
| Decline | User declines updated terms/policy | User can decline, access restricted. | Not implemented. | Not Implemented | No code for consent tracking. | None | E2E test: Decline terms, verify restriction. |
| Error Handling | Fail to record consent | Error message shown, consent not recorded. | Not implemented. | Not Implemented | No code for consent tracking. | None | E2E test: Simulate error, check message. |

---

## User Support/Contact/Feedback Flow (Lower Priority)

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to support/contact/feedback page | Support/contact/feedback option is visible and accessible. | Not implemented. No code or UI for support/contact/feedback. | Not Implemented | No code for support/contact/feedback. | None | E2E test: Navigate to support/contact, verify option. |
| Submit Request | Submit support ticket or feedback | User can submit request, confirmation shown. | Not implemented. | Not Implemented | No code for submitting request. | None | E2E test: Submit request, verify confirmation. |
| View Status | View status of request/ticket | User can view status/response to request. | Not implemented. | Not Implemented | No code for viewing status. | None | E2E test: View status, verify update. |
| Error Handling | Fail to submit/view request | Error message shown, request not submitted/viewed. | Not implemented. | Not Implemented | No code for error handling. | None | E2E test: Simulate error, check message. |

---

## Account Reactivation Flow (Lower Priority)

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to account reactivation page | Reactivation option is visible and accessible. | Not implemented. No code or UI for account reactivation. | Not Implemented | No code for account reactivation. | None | E2E test: Navigate to reactivation, verify option. |
| Reactivate Account | Submit reactivation request | User can submit request, confirmation shown. | Not implemented. | Not Implemented | No code for reactivating account. | None | E2E test: Submit reactivation, verify confirmation. |
| Error Handling | Fail to reactivate account | Error message shown, account not reactivated. | Not implemented. | Not Implemented | No code for error handling. | None | E2E test: Simulate error, check message. |

---

## API Key Management Flow (Lower Priority)

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to API key management page | API key management option is visible and accessible. | Not implemented. No code or UI for API key management. | Not Implemented | No code for API key management. | None | E2E test: Navigate to API key management, verify option. |
| Create API Key | Create a new API key | User can create API key, key is shown/copied. | Not implemented. | Not Implemented | No code for creating API key. | None | E2E test: Create API key, verify display/copy. |
| Revoke API Key | Revoke an API key | User can revoke API key, confirmation shown. | Not implemented. | Not Implemented | No code for revoking API key. | None | E2E test: Revoke API key, verify removal. |
| Error Handling | Fail to create/revoke API key | Error message shown, action not completed. | Not implemented. | Not Implemented | No code for error handling. | None | E2E test: Simulate error, check message. |

---

## Custom Attribute Management Flow (Lower Priority)

| Flow / Screen / Component | Verification Step | Expected Result | Actual Result | Status | Notes / Screenshot | Existing Automated Tests | Missing Automated Tests |
| :------------------------ | :------------------ | :-----------------| :------------ | :----- | :----------------- | :------------------------- | :------------------------ |
| Entry Point | Navigate to custom attribute management page | Custom attribute management option is visible and accessible. | Not implemented. No code or UI for custom attribute management. | Not Implemented | No code for custom attribute management. | None | E2E test: Navigate to custom attribute management, verify option. |
| Add Attribute | Add a new custom attribute | User can add attribute, attribute is shown. | Not implemented. | Not Implemented | No code for adding attribute. | None | E2E test: Add attribute, verify display. |
| Edit Attribute | Edit a custom attribute | User can edit attribute, changes are saved. | Not implemented. | Not Implemented | No code for editing attribute. | None | E2E test: Edit attribute, verify update. |
| Remove Attribute | Remove a custom attribute | User can remove attribute, confirmation shown. | Not implemented. | Not Implemented | No code for removing attribute. | None | E2E test: Remove attribute, verify removal. |
| Error Handling | Fail to add/edit/remove attribute | Error message shown, action not completed. | Not implemented. | Not Implemented | No code for error handling. | None | E2E test: Simulate error, check message. |

---

## Settings/Profile UI | Account Recovery Options UI | Users can add/manage recovery email/phone for account recovery. | No UI for account recovery options is present in settings or profile. Users cannot add/manage recovery contacts. | Not Implemented | No way for users to manage recovery options in the UI. | None | Add account recovery options UI; E2E/integration test for adding/using recovery contacts. |
| Settings/Profile UI | API Key Management UI | Users can create, view, and revoke API keys. | No UI for API key management is present in settings or profile. Users cannot manage API keys. | Not Implemented | No way for users to manage API keys in the UI. | None | Add API key management UI; E2E/integration test for key creation/revocation. |
| Settings/Profile UI | Custom Attribute Management UI | Users can add, edit, or remove custom attributes. | No UI for custom attribute management is present in settings or profile. Users cannot manage custom attributes. | Not Implemented | No way for users to manage custom attributes in the UI. | None | Add custom attribute management UI; E2E/integration test for attribute management. |
| Settings/Profile UI | Terms & Policy Updates/Consent UI | Users are prompted to re-consent to updated terms/policy. | No UI for terms/policy update or consent management is present. Only static links exist. | Not Implemented | No way for users to re-consent or see updates in the UI. | None | Add terms/policy update/consent UI; E2E/integration test for consent flow. |
| Settings/Profile UI | User Support/Contact/Feedback UI | Users can submit support requests or feedback. | No UI for support/contact/feedback is present in settings or profile. | Not Implemented | No way for users to contact support or submit feedback in the UI. | None | Add support/contact/feedback UI; E2E/integration test for support flow. |
| Settings/Profile UI | Account Reactivation UI | Users can reactivate a deactivated account. | No UI for account reactivation is present in settings or profile. | Not Implemented | No way for users to reactivate accounts in the UI. | None | Add account reactivation UI; E2E/integration test for reactivation flow. |
| Settings/Profile UI | Team/Organization Management UI | Users can manage teams/orgs, invite members, and manage roles. | No UI for team/org management is present in settings or profile. | Not Implemented | No way for users to manage teams/orgs in the UI. | None | Add team/org management UI; E2E/integration test for team/org flows. |
| Settings/Profile UI | Activity/Audit Logging UI | Users can view activity/audit logs. | No UI for activity/audit logging is present in settings or profile. | Not Implemented | No way for users to view logs in the UI. | None | Add activity/audit log UI; E2E/integration test for log viewing/export. |