# Test info

- Name: E2E: Business SSO Admin Configuration >> should display validation errors for invalid configuration
- Location: C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\business-sso-admin-config.e2e.test.ts:183:3

# Error details

```
Error: locator.isChecked: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('switch', { name: /enable sso/i })

    at enableSsoAndSelectType (C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\business-sso-admin-config.e2e.test.ts:41:27)
    at C:\Dev\Projects\Products\Apps\user-management-reorganized\e2e\business-sso-admin-config.e2e.test.ts:184:11
```

# Page snapshot

```yaml
- heading "404" [level=1]
- heading "This page could not be found." [level=2]
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | // TODO: Implement helper for admin login
   4 | // async function loginAsOrgAdmin(page) {
   5 | //   console.log('Logging in as Org Admin...');
   6 | //   // ... login logic
   7 | // }
   8 |
   9 | test.describe('E2E: Business SSO Admin Configuration', () => {
   10 |   // TODO: VERIFY URL/PATTERN: Adjust URL for organization SSO settings
   11 |   const ORG_SSO_SETTINGS_URL = '/organization/settings/sso';
   12 |
   13 |   // Mock SAML data
   14 |   const MOCK_SAML_ENTITY_ID = 'https://mock-idp.com/entity';
   15 |   const MOCK_SAML_SSO_URL = 'https://mock-idp.com/sso';
   16 |   const MOCK_SAML_CERTIFICATE = `-----BEGIN CERTIFICATE-----
   17 | MOCK_CERTIFICATE_DATA
   18 | -----END CERTIFICATE-----`;
   19 |
   20 |   // Mock OIDC data
   21 |   const MOCK_OIDC_CLIENT_ID = 'mock-client-id-123';
   22 |   const MOCK_OIDC_CLIENT_SECRET = 'mock-client-secret-xyz';
   23 |   const MOCK_OIDC_DISCOVERY_URL = 'https://mock-idp.com/.well-known/openid-configuration';
   24 |
   25 |   test.beforeEach(async ({ page }) => {
   26 |     // --- Admin Login --- 
   27 |     // Placeholder: Replace with actual admin login logic
   28 |     // await loginAsOrgAdmin(page);
   29 |     console.log('Placeholder: Execute Org Admin login here...');
   30 |     // --- End Admin Login --- 
   31 |
   32 |     // Navigate to the SSO configuration page
   33 |     await page.goto(ORG_SSO_SETTINGS_URL);
   34 |     await expect(page).toHaveURL(ORG_SSO_SETTINGS_URL);
   35 |   });
   36 |
   37 |   // Helper function within describe block for enabling SSO and selecting type
   38 |   async function enableSsoAndSelectType(page: any, type: 'SAML' | 'OIDC') {
   39 |     // TODO: VERIFY SELECTOR: Ensure switch selector is accurate
   40 |     const ssoSwitch = page.getByRole('switch', { name: /enable sso/i });
>  41 |     if (!(await ssoSwitch.isChecked())) {
      |                           ^ Error: locator.isChecked: Test timeout of 30000ms exceeded.
   42 |       await ssoSwitch.check();
   43 |     }
   44 |     await expect(ssoSwitch).toBeChecked();
   45 |
   46 |     // TODO: VERIFY SELECTOR: Ensure radio button selector is accurate
   47 |     const typeRadio = page.getByRole('radio', { name: type });
   48 |     await typeRadio.check();
   49 |     await expect(typeRadio).toBeChecked();
   50 |   }
   51 |
   52 |   test('should allow admin to enable/disable Business SSO', async ({ page }) => {
   53 |     // TODO: VERIFY SELECTOR: Update selector for the SSO enable/disable switch
   54 |     const ssoSwitch = page.getByRole('switch', { name: /enable sso/i }); // Adjust name/role if needed
   55 |
   56 |     // Assuming initial state is disabled (adjust if needed)
   57 |     await expect(ssoSwitch).not.toBeChecked();
   58 |
   59 |     // Enable SSO
   60 |     await ssoSwitch.check(); 
   61 |     await expect(ssoSwitch).toBeChecked();
   62 |     // Optionally: Check if config sections become visible
   63 |     // await expect(page.getByText('SAML Configuration')).toBeVisible();
   64 |
   65 |     // Disable SSO
   66 |     await ssoSwitch.uncheck();
   67 |     await expect(ssoSwitch).not.toBeChecked();
   68 |     // Optionally: Check if config sections are hidden
   69 |     // await expect(page.getByText('SAML Configuration')).not.toBeVisible();
   70 |   });
   71 |
   72 |   test('should allow admin to select IDP type (SAML/OIDC)', async ({ page }) => {
   73 |     // TODO: VERIFY SELECTOR: Update selector for the SSO enable/disable switch
   74 |     const ssoSwitch = page.getByRole('switch', { name: /enable sso/i }); 
   75 |
   76 |     // Ensure SSO is enabled first
   77 |     if (!(await ssoSwitch.isChecked())) {
   78 |       await ssoSwitch.check();
   79 |     }
   80 |     await expect(ssoSwitch).toBeChecked(); // Verify it's enabled
   81 |
   82 |     // TODO: VERIFY SELECTOR: Update selectors for SAML/OIDC radio buttons/options
   83 |     const samlRadio = page.getByRole('radio', { name: 'SAML' });
   84 |     const oidcRadio = page.getByRole('radio', { name: 'OIDC' });
   85 |
   86 |     // TODO: VERIFY SELECTOR: Update selectors for representative SAML/OIDC input fields
   87 |     const samlEntityIdInput = page.getByLabel(/entity id/i); // Example SAML field
   88 |     const oidcClientIdInput = page.getByLabel(/client id/i); // Example OIDC field
   89 |
   90 |     // Select SAML
   91 |     await samlRadio.check();
   92 |     await expect(samlRadio).toBeChecked();
   93 |     await expect(oidcRadio).not.toBeChecked();
   94 |     await expect(samlEntityIdInput).toBeVisible();
   95 |     await expect(oidcClientIdInput).not.toBeVisible();
   96 |
   97 |     // Select OIDC
   98 |     await oidcRadio.check();
   99 |     await expect(oidcRadio).toBeChecked();
  100 |     await expect(samlRadio).not.toBeChecked();
  101 |     await expect(oidcClientIdInput).toBeVisible();
  102 |     await expect(samlEntityIdInput).not.toBeVisible();
  103 |   });
  104 |
  105 |   test('should allow admin to configure SAML settings', async ({ page }) => {
  106 |     await enableSsoAndSelectType(page, 'SAML');
  107 |
  108 |     // TODO: VERIFY SELECTOR: Update selectors for SAML input fields
  109 |     const entityIdInput = page.getByLabel(/entity id/i);
  110 |     const ssoUrlInput = page.getByLabel(/sso url/i);
  111 |     const certificateInput = page.getByLabel(/certificate/i); // Assuming textarea or similar
  112 |     const saveButton = page.getByRole('button', { name: /save/i });
  113 |
  114 |     // Fill the form
  115 |     await entityIdInput.fill(MOCK_SAML_ENTITY_ID);
  116 |     await ssoUrlInput.fill(MOCK_SAML_SSO_URL);
  117 |     await certificateInput.fill(MOCK_SAML_CERTIFICATE);
  118 |
  119 |     // Save settings
  120 |     await saveButton.click();
  121 |
  122 |     // TODO: VERIFY SELECTOR & MESSAGE: Check for success message/toast
  123 |     const successMessage = page.getByRole('alert', { name: /success|settings saved/i });
  124 |     await expect(successMessage).toBeVisible();
  125 |     // Hide the message if necessary for subsequent checks
  126 |     // await successMessage.evaluate(el => el.style.display = 'none'); 
  127 |
  128 |     // Reload and verify persistence
  129 |     await page.reload();
  130 |     await enableSsoAndSelectType(page, 'SAML'); // Re-select SAML after reload
  131 |
  132 |     // TODO: VERIFY SELECTOR: Ensure selectors are still valid after reload
  133 |     const entityIdInputAfterReload = page.getByLabel(/entity id/i);
  134 |     const ssoUrlInputAfterReload = page.getByLabel(/sso url/i);
  135 |     const certificateInputAfterReload = page.getByLabel(/certificate/i);
  136 |
  137 |     await expect(entityIdInputAfterReload).toHaveValue(MOCK_SAML_ENTITY_ID);
  138 |     await expect(ssoUrlInputAfterReload).toHaveValue(MOCK_SAML_SSO_URL);
  139 |     // TODO: VERIFY CERTIFICATE: How to verify certificate persistence depends on the UI.
  140 |     // Maybe check if the textarea has content, or if a specific element indicates a cert is present.
  141 |     await expect(certificateInputAfterReload).not.toBeEmpty(); // Basic check
```