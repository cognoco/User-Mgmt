# Test info

- Name: E2E: Business SSO User Login >> should show error if IDP authentication fails or user is not authorized
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\business-sso-user-login.e2e.test.ts:118:3

# Error details

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
  navigated to "http://localhost:3000/login/test-org-saml"
============================================================
    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\business-sso-user-login.e2e.test.ts:142:16
```

# Page snapshot

```yaml
- heading "404" [level=1]
- heading "This page could not be found." [level=2]
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   42 |
   43 |     // TODO: VERIFY URL/PATTERN: Verify the expected Mock SAML IdP URL pattern
   44 |     await page.waitForURL(MOCK_SAML_IDP_URL_PATTERN);
   45 |     await expect(page).toHaveURL(MOCK_SAML_IDP_URL_PATTERN);
   46 |   });
   47 |
   48 |   test('should redirect to IDP when accessing login page (OIDC)', async ({ page }) => {
   49 |     // TODO: VERIFY FLOW: Adjust navigation if login starts differently
   50 |     const oidcLoginUrl = ORG_LOGIN_URL_PATTERN(TEST_ORG_ID_OIDC);
   51 |     await page.goto(oidcLoginUrl);
   52 |
   53 |     // TODO: VERIFY URL/PATTERN: Verify the expected Mock OIDC IdP URL pattern
   54 |     await page.waitForURL(MOCK_OIDC_IDP_URL_PATTERN);
   55 |     await expect(page).toHaveURL(MOCK_OIDC_IDP_URL_PATTERN);
   56 |   });
   57 |
   58 |   test('should log in user successfully after IDP authentication (SAML)', async ({ page }) => {
   59 |     // Note: Assumes TEST_ORG_ID_SAML and TEST_USER_EMAIL are set up.
   60 |     
   61 |     // TODO: VERIFY URL/PATTERN: Verify SAML callback pattern is correct
   62 |     await page.route(SAML_CALLBACK_PATTERN, async (route) => {
   63 |       console.log(`Intercepted SAML Callback (Success): ${route.request().url()}`);
   64 |       // TODO: VERIFY CONFIG: Verify DASHBOARD_URL is correct post-login destination
   65 |       // TODO: VERIFY AUTH: Add mock Set-Cookie header(s) if needed by frontend
   66 |       await route.fulfill({
   67 |         status: 302, 
   68 |         headers: { Location: DASHBOARD_URL },
   69 |       });
   70 |     });
   71 |
   72 |     // Navigate to the org-specific login URL to initiate the SAML flow
   73 |     // TODO: VERIFY FLOW: Adjust navigation if login starts differently
   74 |     const samlLoginUrl = ORG_LOGIN_URL_PATTERN(TEST_ORG_ID_SAML);
   75 |     await page.goto(samlLoginUrl);
   76 |
   77 |     // Wait for the navigation to the dashboard (result of mocked callback)
   78 |     // TODO: VERIFY CONFIG: Verify DASHBOARD_URL is correct
   79 |     await page.waitForURL(DASHBOARD_URL);
   80 |     await expect(page).toHaveURL(DASHBOARD_URL);
   81 |
   82 |     // TODO: VERIFY SELECTOR: Verify/Update locator for logged-in user indicator
   83 |     const userAvatar = page.getByTestId('user-avatar'); 
   84 |     await expect(userAvatar).toBeVisible();
   85 |     // Optionally, check if the correct user is logged in if possible (e.g., check displayed email/name)
   86 |   });
   87 |
   88 |   test('should log in user successfully after IDP authentication (OIDC)', async ({ page }) => {
   89 |     // Note: Assumes TEST_ORG_ID_OIDC and TEST_USER_EMAIL are set up.
   90 |     
   91 |     // TODO: VERIFY URL/PATTERN: Verify OIDC callback pattern is correct
   92 |     await page.route(OIDC_CALLBACK_PATTERN, async (route) => {
   93 |       console.log(`Intercepted OIDC Callback (Success): ${route.request().url()}`);
   94 |       // TODO: VERIFY CONFIG: Verify DASHBOARD_URL is correct post-login destination
   95 |       // TODO: VERIFY AUTH: Add mock Set-Cookie header(s) if needed by frontend
   96 |       await route.fulfill({
   97 |         status: 302, 
   98 |         headers: { Location: DASHBOARD_URL },
   99 |       });
  100 |     });
  101 |
  102 |     // Navigate to the org-specific login URL to initiate the OIDC flow
  103 |     // TODO: VERIFY FLOW: Adjust navigation if login starts differently
  104 |     const oidcLoginUrl = ORG_LOGIN_URL_PATTERN(TEST_ORG_ID_OIDC);
  105 |     await page.goto(oidcLoginUrl);
  106 |
  107 |     // Wait for the navigation to the dashboard (result of mocked callback)
  108 |     // TODO: VERIFY CONFIG: Verify DASHBOARD_URL is correct
  109 |     await page.waitForURL(DASHBOARD_URL);
  110 |     await expect(page).toHaveURL(DASHBOARD_URL);
  111 |
  112 |     // TODO: VERIFY SELECTOR: Verify/Update locator for logged-in user indicator
  113 |     const userAvatar = page.getByTestId('user-avatar'); 
  114 |     await expect(userAvatar).toBeVisible();
  115 |     // Optionally, check if the correct user is logged in if possible (e.g., check displayed email/name)
  116 |   });
  117 |
  118 |   test('should show error if IDP authentication fails or user is not authorized', async ({ page }) => {
  119 |     // Note: Assumes TEST_ORG_ID_SAML is set up.
  120 |     const samlLoginUrl = ORG_LOGIN_URL_PATTERN(TEST_ORG_ID_SAML);
  121 |     // TODO: VERIFY ERROR HANDLING: Verify the exact URL pattern (path & query params) for SSO login errors
  122 |     const expectedErrorUrlPattern = /.*\?error=sso_failed&reason=auth_error.*/i; // Example pattern
  123 |
  124 |     // TODO: VERIFY URL/PATTERN: Verify SAML callback pattern is correct
  125 |     await page.route(SAML_CALLBACK_PATTERN, async (route) => {
  126 |       console.log(`Intercepted SAML Callback (Failure): ${route.request().url()}`);
  127 |       // Simulate backend failure (e.g., invalid SAML assertion, user not found/authorized)
  128 |       // TODO: VERIFY ERROR HANDLING: Verify the exact redirect URL & query params for this error case
  129 |       const errorRedirectUrl = `${samlLoginUrl}?error=sso_failed&reason=auth_error`;
  130 |       await route.fulfill({
  131 |         status: 302,
  132 |         headers: { Location: errorRedirectUrl },
  133 |       });
  134 |     });
  135 |
  136 |     // Navigate to the org-specific login URL to initiate the SAML flow
  137 |     // TODO: VERIFY FLOW: Adjust navigation if login starts differently
  138 |     await page.goto(samlLoginUrl);
  139 |
  140 |     // Wait for navigation back to the login page with the specific error
  141 |     // TODO: VERIFY URL/PATTERN: Verify the expected error URL pattern is correct
> 142 |     await page.waitForURL(expectedErrorUrlPattern);
      |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  143 |     await expect(page).toHaveURL(expectedErrorUrlPattern);
  144 |
  145 |     // TODO: VERIFY SELECTOR: Verify/Update locator for the specific error message element
  146 |     const errorMessage = page.getByRole('alert'); // Assuming error shown on login page
  147 |     await expect(errorMessage).toBeVisible();
  148 |     // TODO: VERIFY ERROR HANDLING: Verify the exact error message text displayed
  149 |     await expect(errorMessage).toContainText(/login failed|unable to authenticate|not authorized/i);
  150 |     
  151 |     // Assert user is not logged in (e.g., dashboard elements not visible, login form still present)
  152 |     // TODO: VERIFY SELECTOR: Check that a logged-in indicator is NOT visible
  153 |     await expect(page.getByTestId('user-avatar')).not.toBeVisible(); 
  154 |   });
  155 |
  156 |   // TODO: Consider adding tests for edge cases: SLO (Single Log Out) if implemented, session expiration, IDP downtime simulation.
  157 | }); 
```