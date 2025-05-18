Implementation Plan – Phase 3: Business User Registration & Core Profile
1. Business Registration Flow
[x] Frontend: Registration Form
[x] Add "Personal" vs. "Business" account toggle/tabs on registration page.
[x] Implement business registration form fields:
[x] First Name, Last Name, Email, Password, Confirm Password
[x] Company Name, Company Size (dropdown), Industry (dropdown/searchable), Company Website (optional, URL validation)
[x] Position/Job Title, Department (optional)
[x] Terms & Conditions checkbox with clickable links
[x] Add real-time validation for all fields (including company website, required fields, password strength, etc.)
[x] UX: Show dynamic helper for password requirements.
[x] UX: Show error messages under relevant fields.
[x] UX: Handle edge cases (existing email, company already exists, etc.)
[x] UX: Add "Upgrade to Business Account" flow for existing personal users.
[x] Backend: Registration Endpoint
[x] Extend /api/auth/register to handle
[x] Validate all new fields (company, job title, etc.) server-side.
[x] Handle edge cases:
[x] Email already exists (personal/business)
[x] Company already exists/claimed
[x] Rate limiting, general server errors
[x] Return clear, user-friendly error messages for all cases.
[x] Testing
[x] Integration tests for business registration (all fields, edge cases).
[x] E2E test for business registration flow (including error and success states).
2. Business Profile View & Edit
[x] Frontend: Business Profile Page
[x] Display combined user and company info (as per spec).
[x] Show verification status, edit buttons (permission-based, admin only).
[x] Show placeholders for missing/incomplete fields.
[x] Handle error/empty states gracefully.
[x] Frontend: Edit Company Details
[x] Implement edit mode for company fields (pre-filled, Save/Cancel UX).
[x] Add real-time validation for all editable fields.
[x] UX: Save/Cancel buttons, revert on cancel.
[x] UX: Show feedback for success, validation, permission, and network errors.
[x] Handle edge cases (restricted fields, re-verification triggers, concurrent edits).
[x] Backend: Business Profile API
[x] Ensure /api/profile/business supports GET and UPDATE (PUT/PATCH) for all required fields.
[x] Enforce permission checks (only admins can edit company details).
[x] Implement logic for re-verification on critical changes (PATCH sets verificationStatus to 'pending' if VAT ID or company name changes).
[x] Handle concurrent edits (optimistic locking or last-write-wins) [TODO].
[x] Testing
[x] Integration tests for profile view, edit, and error states (skeleton present, expand as needed).
[x] E2E test for business profile CRUD (including permission and edge cases) now implemented and covers all required flows.
3. Company Logo Upload
[x] Frontend: Logo Upload UI
[x] Add logo upload/change button in profile view/edit.
[x] Implement file picker, preview, cropping tool (square/aspect ratio).
[x] Validate file type (JPG, PNG, GIF, WEBP), size, and show errors. (SVG not currently supported by default, noted)
[x] Show upload progress and feedback for success/error.
[x] Backend: Logo Upload Endpoint
[x] Implement /api/profile/logo for company logo upload.
[x] Validate file type/size, store securely, update company profile. (Aligned MAX_FILE_SIZE to 2MB)
[x] Handle permission errors, upload failures, and return clear messages.
[x] Testing
[x] Integration tests updated for logo upload (valid/invalid files, error states).
[x] E2E tests implemented for logo upload (happy path, invalid file, large file, remove logo).
4. Business Address & Contact Management
[x] Frontend: Address & Contact Fields
[x] Add/edit required fields in company profile: State/Province, City, Contact Email, Contact Phone.
[x] Remove address verification and business existence checks; we are not responsible for verifying these.
[x] Ensure email verification is handled as part of the standard user flow (already implemented).
[x] Backend: Storage & Validation
[x] Ensure state, city, contact email, and phone are required and validated in the backend.
[x] No address or business existence verification is performed.
[x] Testing
[x] Integration and E2E tests for CRUD of these fields and validation errors.
5. Company Validation (e.g., VAT ID)
[x] No company existence or VAT ID validation is required at this stage; treat as optional fields.
6. Business Domain Verification
[x] DNS TXT-based domain verification only (no email-based fallback).
[ ] Frontend: Domain Verification UI
[ ] Add UI for domain verification (instructions, TXT record, status, trigger button).
[ ] Handle multiple domains, domain change resets, and all feedback states.
[ ] Backend: Domain Verification Endpoint
[ ] Implement /api/company/verify-domain for domain verification logic (DNS TXT record check only).
[ ] Generate/store verification code, check DNS, update status.
[ ] Reset verification on website/domain change.
[ ] Admin Notification Settings
[ ] Add admin option to receive notifications when new members join via the verified domain.
[ ] Testing
[ ] Integration and E2E tests for domain verification flow, all edge/error cases, and admin notifications.
7. Edge Cases & UX Gaps
[ ] Handle all edge cases and missing UX:
[ ] Duplicate email (personal/business), company name typos, "Upgrade to Business" flow, T&C links, etc.
[ ] Placeholders for incomplete data, error/empty states, permission errors, concurrent edits, etc.
[ ] Testing
[ ] E2E and integration tests for all edge cases and user experience gaps.

Business registration flow (frontend, backend, and integration tests) is now implemented and covered. E2E test pending.

Integration test skeleton for /api/profile/business created. Test logic implementation in progress.

References:
functionality-features-phase3.md
Implementation-Checklist.md
GAP_ANALYSIS.md


All new business registration/profile features must be testable using these patterns.
All form fields, validation, and error states must have reliable selectors and feedback.
E2E tests must be robust to browser differences and incomplete backend states.
Optional features (like business registration) must be force-enabled in test environments.
All edge cases and error flows described in the requirements must be covered by E2E tests.