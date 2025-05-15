# Test info

- Name: Profile Verification UI >> User can request verification with document upload enabled
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\profile-verification.e2e.test.ts:24:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: getByText('Profile Verification')
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for getByText('Profile Verification')

    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\profile-verification.e2e.test.ts:27:58
```

# Page snapshot

```yaml
- alert: User not authenticated
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | // These tests assume a test user is already logged in and on the profile page
   4 | // and that the backend is set up to mock or accept verification requests.
   5 |
   6 | test.describe('Profile Verification UI', () => {
   7 |   test('User can request verification without document upload', async ({ page }) => {
   8 |     // Go to profile page
   9 |     await page.goto('/profile');
  10 |     // Wait for the ProfileVerification UI
  11 |     await expect(page.getByText('Profile Verification')).toBeVisible();
  12 |     // Should show unverified status and request button
  13 |     await expect(page.getByText(/not verified/i)).toBeVisible();
  14 |     const requestBtn = page.getByRole('button', { name: /request verification/i });
  15 |     await expect(requestBtn).toBeVisible();
  16 |     // Click request
  17 |     await requestBtn.click();
  18 |     // Simulate backend response: status becomes pending
  19 |     await expect(page.getByText(/pending review/i)).toBeVisible();
  20 |     // Request button should disappear
  21 |     await expect(page.getByRole('button', { name: /request verification/i })).not.toBeVisible();
  22 |   });
  23 |
  24 |   test('User can request verification with document upload enabled', async ({ page }) => {
  25 |     // Go to profile page with document upload enabled (assume feature flag or prop is set in test env)
  26 |     await page.goto('/profile?docUpload=1'); // Or however the feature is toggled in your test setup
> 27 |     await expect(page.getByText('Profile Verification')).toBeVisible();
     |                                                          ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  28 |     // Should show upload field
  29 |     const fileInput = page.getByLabelText(/upload supporting document/i);
  30 |     await expect(fileInput).toBeVisible();
  31 |     // Simulate file selection (mock file)
  32 |     await fileInput.setInputFiles({ name: 'testdoc.pdf', mimeType: 'application/pdf', buffer: Buffer.from('dummy') });
  33 |     // Click request
  34 |     const requestBtn = page.getByRole('button', { name: /request verification/i });
  35 |     await requestBtn.click();
  36 |     // Simulate backend response: status becomes pending
  37 |     await expect(page.getByText(/pending review/i)).toBeVisible();
  38 |   });
  39 |
  40 |   test('Rejected status and admin feedback are shown', async ({ page }) => {
  41 |     // Simulate backend returns rejected status with feedback
  42 |     await page.goto('/profile?mockRejected=1'); // Assume test env or MSW returns rejected
  43 |     await expect(page.getByText('Profile Verification')).toBeVisible();
  44 |     await expect(page.getByText(/rejected/i)).toBeVisible();
  45 |     await expect(page.getByText(/reason/i)).toBeVisible();
  46 |     await expect(page.getByRole('button', { name: /request verification/i })).toBeVisible();
  47 |   });
  48 |
  49 |   test('Verified status is shown', async ({ page }) => {
  50 |     // Simulate backend returns verified status
  51 |     await page.goto('/profile?mockVerified=1'); // Assume test env or MSW returns verified
  52 |     await expect(page.getByText('Profile Verification')).toBeVisible();
  53 |     await expect(page.getByText(/verified/i)).toBeVisible();
  54 |     await expect(page.getByText(/your profile is verified/i)).toBeVisible();
  55 |   });
  56 | });
  57 |
```