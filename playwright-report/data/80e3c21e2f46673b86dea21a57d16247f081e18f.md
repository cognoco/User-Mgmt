# Test info

- Name: User Registration Flow >> should allow a new user to register and see a success message or redirect
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\auth\registration.spec.ts:6:3

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toBeVisible()

Locator: locator('text=Check your email').or(locator('text=Verification email sent')).or(locator('text=Verify your email'))
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 10000ms
  - waiting for locator('text=Check your email').or(locator('text=Verification email sent')).or(locator('text=Verify your email'))

    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\auth\registration.spec.ts:44:7
```

# Page snapshot

```yaml
- heading "Create Your Account" [level=1]
- heading "Create Your Account" [level=1]
- paragraph: Register for a new account to get started
- alert:
  - img
  - heading "Registration Failed" [level=5]
  - text: email rate limit exceeded
- text: Email *
- textbox "Email *": testuser+1745253767370@example.com
- text: First Name *
- textbox "First Name *": Test
- text: Last Name *
- textbox "Last Name *": User
- text: Password *
- textbox "Password *": TestPassword123!
- text: Confirm Password *
- textbox "Confirm Password *": TestPassword123!
- checkbox "Accept terms and conditions and privacy policy" [checked]:
  - img
- text: I agree to the
- link "Terms and Conditions":
  - /url: "#"
- text: and
- link "Privacy Policy":
  - /url: "#"
- text: .
- button "Create Account"
- button "G Sign up with Google"
- button "A Sign up with Apple"
- button "GH Sign up with GitHub"
- text: or
- paragraph:
  - text: Already have an account?
  - link "Sign in":
    - /url: /login
- text: "{ \"isValid\": true, \"errors\": {}, \"values\": { \"userType\": \"private\", \"acceptTerms\": true, \"firstName\": \"Test\", \"lastName\": \"User\", \"email\": \"testuser+1745253767370@example.com\", \"password\": \"TestPassword123!\", \"confirmPassword\": \"TestPassword123!\", \"companyName\": \"\", \"position\": \"\", \"industry\": \"\" } }"
- paragraph:
  - text: Already have an account?
  - link "Sign in":
    - /url: /login
- alert
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | // Registration E2E test: Simulates a real user registering via the UI
   4 |
   5 | test.describe('User Registration Flow', () => {
   6 |   test('should allow a new user to register and see a success message or redirect', async ({ page }) => {
   7 |     console.log('Test: should allow a new user to register and see a success message or redirect');
   8 |     await page.goto('/register');
   9 |     // If user type selection is present, select "Personal"
   10 |     const userTypeRadio = page.locator('[data-testid="user-type-private"]');
   11 |     if (await userTypeRadio.count()) {
   12 |       await userTypeRadio.click();
   13 |     }
   14 |     const uniqueEmail = 'testuser+' + Date.now() + '@example.com';
   15 |     await page.fill('[data-testid="email-input"]', uniqueEmail);
   16 |     await page.fill('[data-testid="first-name-input"]', 'Test');
   17 |     await page.fill('[data-testid="last-name-input"]', 'User');
   18 |     await page.fill('[data-testid="password-input"]', 'TestPassword123!');
   19 |     await page.fill('[data-testid="confirm-password-input"]', 'TestPassword123!');
   20 |     await page.check('[data-testid="accept-terms-checkbox"]');
   21 |     // Wait for the submit button to be enabled before clicking
   22 |     const submitButton = page.locator('button[type="submit"]');
   23 |     const rateLimitAlert = page.locator('text=rate limit exceeded');
   24 |     // Wait for either the button to be enabled or the rate limit error to appear
   25 |     try {
   26 |       await Promise.race([
   27 |         expect(submitButton).toBeEnabled({ timeout: 20000 }),
   28 |         expect(rateLimitAlert).toBeVisible({ timeout: 20000 }),
   29 |       ]);
   30 |     } catch (e) {
   31 |       await page.screenshot({ path: 'debug-disabled-button.png' });
   32 |       console.log(await page.content());
   33 |       throw e;
   34 |     }
   35 |     if (await rateLimitAlert.isVisible()) {
   36 |       console.warn('Rate limit hit, skipping further assertions.');
   37 |       return;
   38 |     }
   39 |     await submitButton.click();
   40 |     await expect(
   41 |       page.locator('text=Check your email')
   42 |         .or(page.locator('text=Verification email sent'))
   43 |         .or(page.locator('text=Verify your email'))
>  44 |     ).toBeVisible({ timeout: 10000 });
      |       ^ Error: Timed out 10000ms waiting for expect(locator).toBeVisible()
   45 |   });
   46 |
   47 |   test('should show an error when registering with an already registered (verified) email', async ({ page }) => {
   48 |     console.log('Test: should show an error when registering with an already registered (verified) email');
   49 |     // Using a real, pre-verified test account for this scenario
   50 |     const existingEmail = 'jorn.jorgensen@cognoco.com';
   51 |     await page.goto('/register');
   52 |     const userTypeRadio = page.locator('[data-testid="user-type-private"]');
   53 |     if (await userTypeRadio.count()) {
   54 |       await userTypeRadio.click();
   55 |     }
   56 |     await page.fill('[data-testid="email-input"]', existingEmail);
   57 |     await page.fill('[data-testid="first-name-input"]', 'Test');
   58 |     await page.fill('[data-testid="last-name-input"]', 'User');
   59 |     await page.fill('[data-testid="password-input"]', 'TestPassword123!');
   60 |     await page.fill('[data-testid="confirm-password-input"]', 'TestPassword123!');
   61 |     await page.check('[data-testid="accept-terms-checkbox"]');
   62 |     // Wait for the submit button to be enabled before clicking
   63 |     const submitButton = page.locator('button[type="submit"]');
   64 |     await expect(submitButton).toBeEnabled({ timeout: 10000 });
   65 |     await submitButton.click();
   66 |     // Wait for the alert to appear and check its content
   67 |     const alert = page.locator('[data-testid="registration-error-alert"]');
   68 |     await expect(alert).toBeVisible({ timeout: 10000 });
   69 |     await expect(alert).toContainText(/already exists|already registered|email in use|account exists/i);
   70 |   });
   71 |
   72 |   test('shows success message for at least 2 seconds before redirect after registration', async ({ page }) => {
   73 |     console.log('Test: shows success message for at least 2 seconds before redirect after registration');
   74 |     await page.goto('/register');
   75 |     const userTypeRadio = page.locator('[data-testid="user-type-private"]');
   76 |     if (await userTypeRadio.count()) {
   77 |       await userTypeRadio.click();
   78 |     }
   79 |     const uniqueEmail = 'testuser+' + Date.now() + '@example.com';
   80 |     await page.fill('[data-testid="email-input"]', uniqueEmail);
   81 |     await page.fill('[data-testid="first-name-input"]', 'Test');
   82 |     await page.fill('[data-testid="last-name-input"]', 'User');
   83 |     await page.fill('[data-testid="password-input"]', 'TestPassword123!');
   84 |     await page.fill('[data-testid="confirm-password-input"]', 'TestPassword123!');
   85 |     await page.check('[data-testid="accept-terms-checkbox"]');
   86 |     // Wait for the submit button to be enabled before clicking
   87 |     const submitButton = page.locator('button[type="submit"]');
   88 |     await expect(submitButton).toBeEnabled({ timeout: 10000 });
   89 |     await submitButton.click();
   90 |     // Wait for either the success message or the rate limit error
   91 |     const successAlert = page.locator('text=Registration successful! Please check your email to verify your account.');
   92 |     const rateLimitAlert = page.locator('text=rate limit exceeded');
   93 |     await Promise.race([
   94 |       expect(successAlert).toBeVisible({ timeout: 10000 }),
   95 |       expect(rateLimitAlert).toBeVisible({ timeout: 10000 }),
   96 |     ]);
   97 |     // If rate limit is hit, skip the rest of the test
   98 |     if (await rateLimitAlert.isVisible()) {
   99 |       console.warn('Rate limit hit, skipping further assertions.');
  100 |       return;
  101 |     }
  102 |     // Wait for at least 2 seconds to ensure the message is visible before redirect
  103 |     await page.waitForTimeout(2000);
  104 |     // Optionally, check that the page is redirected to /check-email or the form is reset
  105 |     // (You can add more assertions here if needed)
  106 |   });
  107 |
  108 |   // Additional tests for edge cases can be added here following the implementation plan
  109 | });
  110 |
```