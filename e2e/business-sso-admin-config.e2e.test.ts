import { test, expect } from '@playwright/test';

// TODO: Implement helper for admin login
// async function loginAsOrgAdmin(page) {
//   console.log('Logging in as Org Admin...');
//   // ... login logic
// }

test.describe('E2E: Business SSO Admin Configuration', () => {
  // TODO: VERIFY URL/PATTERN: Adjust URL for organization SSO settings
  const ORG_SSO_SETTINGS_URL = '/organization/settings/sso';

  // Mock SAML data
  const MOCK_SAML_ENTITY_ID = 'https://mock-idp.com/entity';
  const MOCK_SAML_SSO_URL = 'https://mock-idp.com/sso';
  const MOCK_SAML_CERTIFICATE = `-----BEGIN CERTIFICATE-----
MOCK_CERTIFICATE_DATA
-----END CERTIFICATE-----`;

  // Mock OIDC data
  const MOCK_OIDC_CLIENT_ID = 'mock-client-id-123';
  const MOCK_OIDC_CLIENT_SECRET = 'mock-client-secret-xyz';
  const MOCK_OIDC_DISCOVERY_URL = 'https://mock-idp.com/.well-known/openid-configuration';

  test.beforeEach(async ({ page }) => {
    // --- Admin Login --- 
    // Placeholder: Replace with actual admin login logic
    // await loginAsOrgAdmin(page);
    console.log('Placeholder: Execute Org Admin login here...');
    // --- End Admin Login --- 

    // Navigate to the SSO configuration page
    await page.goto(ORG_SSO_SETTINGS_URL);
    await expect(page).toHaveURL(ORG_SSO_SETTINGS_URL);
  });

  // Helper function within describe block for enabling SSO and selecting type
  async function enableSsoAndSelectType(page: any, type: 'SAML' | 'OIDC') {
    // TODO: VERIFY SELECTOR: Ensure switch selector is accurate
    const ssoSwitch = page.getByRole('switch', { name: /enable sso/i });
    if (!(await ssoSwitch.isChecked())) {
      await ssoSwitch.check();
    }
    await expect(ssoSwitch).toBeChecked();

    // TODO: VERIFY SELECTOR: Ensure radio button selector is accurate
    const typeRadio = page.getByRole('radio', { name: type });
    await typeRadio.check();
    await expect(typeRadio).toBeChecked();
  }

  test('should allow admin to enable/disable Business SSO', async ({ page }) => {
    // TODO: VERIFY SELECTOR: Update selector for the SSO enable/disable switch
    const ssoSwitch = page.getByRole('switch', { name: /enable sso/i }); // Adjust name/role if needed

    // Assuming initial state is disabled (adjust if needed)
    await expect(ssoSwitch).not.toBeChecked();

    // Enable SSO
    await ssoSwitch.check(); 
    await expect(ssoSwitch).toBeChecked();
    // Optionally: Check if config sections become visible
    // await expect(page.getByText('SAML Configuration')).toBeVisible();

    // Disable SSO
    await ssoSwitch.uncheck();
    await expect(ssoSwitch).not.toBeChecked();
    // Optionally: Check if config sections are hidden
    // await expect(page.getByText('SAML Configuration')).not.toBeVisible();
  });

  test('should allow admin to select IDP type (SAML/OIDC)', async ({ page }) => {
    // TODO: VERIFY SELECTOR: Update selector for the SSO enable/disable switch
    const ssoSwitch = page.getByRole('switch', { name: /enable sso/i }); 

    // Ensure SSO is enabled first
    if (!(await ssoSwitch.isChecked())) {
      await ssoSwitch.check();
    }
    await expect(ssoSwitch).toBeChecked(); // Verify it's enabled

    // TODO: VERIFY SELECTOR: Update selectors for SAML/OIDC radio buttons/options
    const samlRadio = page.getByRole('radio', { name: 'SAML' });
    const oidcRadio = page.getByRole('radio', { name: 'OIDC' });

    // TODO: VERIFY SELECTOR: Update selectors for representative SAML/OIDC input fields
    const samlEntityIdInput = page.getByLabel(/entity id/i); // Example SAML field
    const oidcClientIdInput = page.getByLabel(/client id/i); // Example OIDC field

    // Select SAML
    await samlRadio.check();
    await expect(samlRadio).toBeChecked();
    await expect(oidcRadio).not.toBeChecked();
    await expect(samlEntityIdInput).toBeVisible();
    await expect(oidcClientIdInput).not.toBeVisible();

    // Select OIDC
    await oidcRadio.check();
    await expect(oidcRadio).toBeChecked();
    await expect(samlRadio).not.toBeChecked();
    await expect(oidcClientIdInput).toBeVisible();
    await expect(samlEntityIdInput).not.toBeVisible();
  });

  test('should allow admin to configure SAML settings', async ({ page }) => {
    await enableSsoAndSelectType(page, 'SAML');

    // TODO: VERIFY SELECTOR: Update selectors for SAML input fields
    const entityIdInput = page.getByLabel(/entity id/i);
    const ssoUrlInput = page.getByLabel(/sso url/i);
    const certificateInput = page.getByLabel(/certificate/i); // Assuming textarea or similar
    const saveButton = page.getByRole('button', { name: /save/i });

    // Fill the form
    await entityIdInput.fill(MOCK_SAML_ENTITY_ID);
    await ssoUrlInput.fill(MOCK_SAML_SSO_URL);
    await certificateInput.fill(MOCK_SAML_CERTIFICATE);

    // Save settings
    await saveButton.click();

    // TODO: VERIFY SELECTOR & MESSAGE: Check for success message/toast
    const successMessage = page.getByRole('alert', { name: /success|settings saved/i });
    await expect(successMessage).toBeVisible();
    // Hide the message if necessary for subsequent checks
    // await successMessage.evaluate(el => el.style.display = 'none'); 

    // Reload and verify persistence
    await page.reload();
    await enableSsoAndSelectType(page, 'SAML'); // Re-select SAML after reload

    // TODO: VERIFY SELECTOR: Ensure selectors are still valid after reload
    const entityIdInputAfterReload = page.getByLabel(/entity id/i);
    const ssoUrlInputAfterReload = page.getByLabel(/sso url/i);
    const certificateInputAfterReload = page.getByLabel(/certificate/i);

    await expect(entityIdInputAfterReload).toHaveValue(MOCK_SAML_ENTITY_ID);
    await expect(ssoUrlInputAfterReload).toHaveValue(MOCK_SAML_SSO_URL);
    // TODO: VERIFY CERTIFICATE: How to verify certificate persistence depends on the UI.
    // Maybe check if the textarea has content, or if a specific element indicates a cert is present.
    await expect(certificateInputAfterReload).not.toBeEmpty(); // Basic check
  });

  test('should allow admin to configure OIDC settings', async ({ page }) => {
    await enableSsoAndSelectType(page, 'OIDC');

    // TODO: VERIFY SELECTOR: Update selectors for OIDC input fields
    const clientIdInput = page.getByLabel(/client id/i);
    const clientSecretInput = page.getByLabel(/client secret/i);
    const discoveryUrlInput = page.getByLabel(/discovery url|issuer url/i); // Adjust label regex
    const saveButton = page.getByRole('button', { name: /save/i });

    // Fill the form
    await clientIdInput.fill(MOCK_OIDC_CLIENT_ID);
    await clientSecretInput.fill(MOCK_OIDC_CLIENT_SECRET);
    await discoveryUrlInput.fill(MOCK_OIDC_DISCOVERY_URL);

    // Save settings
    await saveButton.click();

    // TODO: VERIFY SELECTOR & MESSAGE: Check for success message/toast
    const successMessage = page.getByRole('alert', { name: /success|settings saved/i });
    await expect(successMessage).toBeVisible();
    // Hide the message if necessary for subsequent checks
    // await successMessage.evaluate(el => el.style.display = 'none'); 

    // Reload and verify persistence
    await page.reload();
    await enableSsoAndSelectType(page, 'OIDC'); // Re-select OIDC after reload

    // TODO: VERIFY SELECTOR: Ensure selectors are still valid after reload
    const clientIdInputAfterReload = page.getByLabel(/client id/i);
    const clientSecretInputAfterReload = page.getByLabel(/client secret/i);
    const discoveryUrlInputAfterReload = page.getByLabel(/discovery url|issuer url/i);

    await expect(clientIdInputAfterReload).toHaveValue(MOCK_OIDC_CLIENT_ID);
    await expect(discoveryUrlInputAfterReload).toHaveValue(MOCK_OIDC_DISCOVERY_URL);
    // Client Secret should typically NOT be readable after save for security
    await expect(clientSecretInputAfterReload).toBeVisible(); // Check it exists
    await expect(clientSecretInputAfterReload).toBeEmpty(); // Assert it's empty or masked (adjust if masked)
  });

  test('should display validation errors for invalid configuration', async ({ page }) => {
    await enableSsoAndSelectType(page, 'SAML');

    // TODO: VERIFY SELECTOR: Update selectors for SAML input fields & Save button
    const entityIdInput = page.getByLabel(/entity id/i);
    const ssoUrlInput = page.getByLabel(/sso url/i);
    const certificateInput = page.getByLabel(/certificate/i);
    const saveButton = page.getByRole('button', { name: /save/i });
    const successMessage = page.getByRole('alert', { name: /success|settings saved/i });

    // --- Test Empty Required Fields ---
    await saveButton.click();
    
    // TODO: VERIFY SELECTOR & MESSAGE: Check error message for Entity ID
    // This assumes error message is near the input, adjust selector as needed
    const entityIdError = entityIdInput.locator('..').getByRole('alert', { name: /required|cannot be empty/i });
    await expect(entityIdError).toBeVisible();
    
    // TODO: VERIFY SELECTOR & MESSAGE: Check error message for SSO URL
    const ssoUrlError = ssoUrlInput.locator('..').getByRole('alert', { name: /required|cannot be empty/i });
    await expect(ssoUrlError).toBeVisible();
    
    // TODO: VERIFY SELECTOR & MESSAGE: Check error message for Certificate
    const certificateError = certificateInput.locator('..').getByRole('alert', { name: /required|cannot be empty/i });
    await expect(certificateError).toBeVisible();
    
    await expect(successMessage).not.toBeVisible(); // Ensure save didn't succeed

    // --- Test Invalid URL Format ---
    // Clear previous errors if necessary (depends on UI)
    // await page.reload(); 
    // await enableSsoAndSelectType(page, 'SAML');
    
    await entityIdInput.fill(MOCK_SAML_ENTITY_ID); // Fill other required fields
    await certificateInput.fill(MOCK_SAML_CERTIFICATE);
    await ssoUrlInput.fill('invalid-url-format'); // Fill with invalid URL
    await saveButton.click();

    // TODO: VERIFY SELECTOR & MESSAGE: Check error message for invalid SSO URL format
    const ssoUrlFormatError = ssoUrlInput.locator('..').getByRole('alert', { name: /invalid url|must be a valid url/i });
    await expect(ssoUrlFormatError).toBeVisible();
    await expect(successMessage).not.toBeVisible(); // Ensure save didn't succeed
  });

  test('should provide necessary information for IDP setup (e.g., ACS URL, SP Entity ID)', async ({ page }) => {
    await enableSsoAndSelectType(page, 'SAML'); // Or OIDC, assuming info is always shown when enabled

    // TODO: VERIFY SELECTOR & VALUE: Update selector and expected value/pattern for ACS URL
    // Assuming it's displayed in a read-only input or specific text element
    const acsUrlElement = page.getByLabel(/acs url|reply url/i);
    await expect(acsUrlElement).toBeVisible();
    // Example check: await expect(acsUrlElement).toHaveValue(/.*\/api\/auth\/callback\/saml/); 
    await expect(acsUrlElement).not.toBeEmpty(); // Basic check

    // TODO: VERIFY SELECTOR: Locate the copy button associated with ACS URL
    const acsUrlCopyButton = acsUrlElement.locator('xpath=following-sibling::button').getByRole('button', { name: /copy/i });
    await expect(acsUrlCopyButton).toBeVisible();

    // TODO: VERIFY SELECTOR & VALUE: Update selector and expected value/pattern for SP Entity ID
    const spEntityIdElement = page.getByLabel(/entity id|audience uri/i);
    await expect(spEntityIdElement).toBeVisible();
    // Example check: await expect(spEntityIdElement).toHaveValue(/.*\/metadata/); 
    await expect(spEntityIdElement).not.toBeEmpty(); // Basic check

    // TODO: VERIFY SELECTOR: Locate the copy button associated with SP Entity ID
    const spEntityIdCopyButton = spEntityIdElement.locator('xpath=following-sibling::button').getByRole('button', { name: /copy/i });
    await expect(spEntityIdCopyButton).toBeVisible();
    
    // Add checks for other relevant SP info if needed (e.g., metadata URL)
  });
}); 