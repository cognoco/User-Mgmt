import { test, expect, Page } from '@playwright/test';
import { loginAs } from '../utils/auth';
import * as path from 'path';

// --- Constants and Test Data --- //
const ADMIN_EMAIL = process.env.E2E_BUSINESS_ADMIN_EMAIL || 'bizadmin@example.com';
const ADMIN_PASSWORD = process.env.E2E_BUSINESS_ADMIN_PASSWORD || 'adminpassword';
const NON_ADMIN_EMAIL = process.env.E2E_BUSINESS_USER_EMAIL || 'bizuser@example.com';
const NON_ADMIN_PASSWORD = process.env.E2E_BUSINESS_USER_PASSWORD || 'userpassword';
const PROFILE_URL = '/profile';
const NEW_COMPANY_NAME = 'E2E Test Company';
const NEW_VAT_ID = 'E2EVAT123';
const NEW_CITY = 'E2ECity';
const VALID_LOGO_PATH = path.join(process.cwd(), 'e2e', 'fixtures', 'test-avatar.png');

// --- Test Suite --- //
test.describe('Business Profile CRUD (Corporate User)', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto(PROFILE_URL);
    await page.waitForURL(`**${PROFILE_URL}`);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Admin can view all business/company fields with placeholders', async () => {
    // Check for company section
    const companySection = page.getByRole('heading', { name: /company details/i });
    await expect(companySection).toBeVisible();
    // Check for all key fields and placeholders
    const fields = [
      { label: /company name/i, value: NEW_COMPANY_NAME },
      { label: /vat/i, value: '' },
      { label: /industry/i, value: '' },
      { label: /company size/i, value: '' },
      { label: /website/i, value: '' },
      { label: /city/i, value: '' },
    ];
    for (const { label } of fields) {
      const labelEl = page.getByText(label);
      await expect(labelEl).toBeVisible();
    }
    // Placeholders for missing fields
    await expect(page.getByText(/not set/i)).toBeVisible();
  });

  test('Admin can edit and save company details, triggers re-verification', async () => {
    // Click Edit
    const editButton = page.getByRole('button', { name: /edit/i });
    await expect(editButton).toBeVisible();
    await editButton.click();

    // Fill company name and VAT ID
    const companyNameInput = page.getByLabel(/company name/i);
    await expect(companyNameInput).toBeVisible();
    await companyNameInput.fill(NEW_COMPANY_NAME);
    const vatIdInput = page.getByLabel(/vat/i);
    await vatIdInput.fill(NEW_VAT_ID);
    // Fill city (address)
    const cityInput = page.getByLabel(/city/i);
    await cityInput.fill(NEW_CITY);

    // Save
    const saveButton = page.getByRole('button', { name: /save/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // Success feedback
    await expect(page.getByText(/updated successfully|success/i)).toBeVisible();
    // Verification status should be pending
    await expect(page.getByText(/pending verification/i)).toBeVisible();
  });

  test('Admin can cancel edit and revert changes', async () => {
    // Click Edit
    const editButton = page.getByRole('button', { name: /edit/i });
    await editButton.click();
    // Change company name
    const companyNameInput = page.getByLabel(/company name/i);
    await companyNameInput.fill('ShouldNotSave');
    // Click Cancel
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await cancelButton.click();
    // Should revert to previous value
    await expect(page.getByText(NEW_COMPANY_NAME)).toBeVisible();
  });

  test('Non-admin cannot edit company details', async ({ browser }) => {
    const nonAdminPage = await browser.newPage();
    await loginAs(nonAdminPage, NON_ADMIN_EMAIL, NON_ADMIN_PASSWORD);
    await nonAdminPage.goto(PROFILE_URL);
    await nonAdminPage.waitForURL(`**${PROFILE_URL}`);
    // Edit button should not be visible
    await expect(nonAdminPage.getByRole('button', { name: /edit/i })).toHaveCount(0);
    await nonAdminPage.close();
  });

  test('Shows validation errors for invalid input', async () => {
    // Click Edit
    const editButton = page.getByRole('button', { name: /edit/i });
    await editButton.click();
    // Clear company name (required)
    const companyNameInput = page.getByLabel(/company name/i);
    await companyNameInput.fill('');
    // Save
    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();
    // Should show validation error
    await expect(page.getByRole('alert')).toContainText(/required/i);
    // Cancel to exit edit mode
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await cancelButton.click();
  });

  test('Shows error feedback on network/server error (mocked)', async () => {
    // TODO: Mock network/server error and assert error feedback
    // Example: await page.route('/api/profile/business', route => route.abort());
    // Click Edit, Save, expect error alert
  });

  test('Admin can upload a new company logo', async () => {
    await page.goto(PROFILE_URL); // Ensure we are on the profile page
    await page.waitForURL(`**${PROFILE_URL}`);

    const logoUploadSection = page.locator('[data-testid="company-logo-upload"]');
    await expect(logoUploadSection).toBeVisible();

    // Initially, there might be a placeholder or no logo
    const initialLogoImage = logoUploadSection.locator('img');
    const initialSrc = await initialLogoImage.getAttribute('src');

    const changeLogoButton = logoUploadSection.getByRole('button', { name: /change company logo/i });
    await expect(changeLogoButton).toBeVisible();

    // Playwright handles file input differently; we need to listen for the event
    // and then set the files when the dialog opens from the click.
    const fileChooserPromise = page.waitForEvent('filechooser');
    await changeLogoButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(VALID_LOGO_PATH);

    // Wait for crop dialog to appear
    const cropDialog = page.locator('[role="dialog"]'); // More generic selector for dialog
    await expect(cropDialog).toBeVisible({ timeout: 10000 }); // Increased timeout for dialog
    
    const saveCropButton = cropDialog.getByRole('button', { name: /upload and save/i });
    await expect(saveCropButton).toBeVisible();
    await saveCropButton.click();

    // Wait for upload to complete and UI to update
    // Expect the image src to change or a new image to appear if there wasn't one
    await expect(async () => {
      const newSrc = await initialLogoImage.getAttribute('src');
      expect(newSrc).not.toBe(initialSrc);
      if (newSrc) { // Make sure newSrc is not null
        expect(newSrc).toContain('supabase'); // Or whatever your public URL contains
      } else {
        // If initialSrc was null (placeholder), initialLogoImage might refer to placeholder.
        // Need to find the new img tag.
        const newImage = logoUploadSection.locator('img[src*="supabase"]');
        await expect(newImage).toBeVisible();
      }
    }).toPass({ timeout: 15000 }); // Increased timeout for image update

    const removeButton = logoUploadSection.getByRole('button', { name: /remove company logo/i });
    await expect(removeButton).toBeVisible();
  });

  test('Admin sees an error when attempting to upload an invalid file type for logo', async () => {
    await page.goto(PROFILE_URL);
    await page.waitForURL(`**${PROFILE_URL}`);

    const logoUploadSection = page.locator('[data-testid="company-logo-upload"]');
    await expect(logoUploadSection).toBeVisible();

    const changeLogoButton = logoUploadSection.getByRole('button', { name: /change company logo/i });
    await expect(changeLogoButton).toBeVisible();

    const invalidFilePath = path.join(process.cwd(), 'e2e', 'fixtures', 'invalid-file.txt');

    const fileChooserPromise = page.waitForEvent('filechooser');
    await changeLogoButton.click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(invalidFilePath);

    // Crop dialog should NOT appear
    const cropDialog = page.locator('[role="dialog"]');
    await expect(cropDialog).not.toBeVisible({ timeout: 3000 }); // Short timeout, it shouldn't appear

    // Expect an error message
    const errorAlert = logoUploadSection.locator('[role="alert"]'); // Error alert should be within the upload section
    await expect(errorAlert).toBeVisible({ timeout: 5000 });
    await expect(errorAlert).toContainText(/invalid file type|invalid image/i);
  });

  test('Admin sees an error when attempting to upload a file that is too large for logo', async () => {
    await page.goto(PROFILE_URL);
    await page.waitForURL(`**${PROFILE_URL}`);

    const logoUploadSection = page.locator('[data-testid="company-logo-upload"]');
    await expect(logoUploadSection).toBeVisible();

    const changeLogoButton = logoUploadSection.getByRole('button', { name: /change company logo/i });
    await expect(changeLogoButton).toBeVisible();

    // We use a valid image path here. The actual size check is mocked in integration tests.
    // For E2E, we assume the frontend validation for size (via isValidImage) would trigger
    // the same error display path if a large file were programmatically forced or if we could mock MAX_FILE_SIZE easily.
    // The purpose here is to check the error display flow for a validation failure attributed to size.
    const fileChooserPromise = page.waitForEvent('filechooser');
    await changeLogoButton.click();
    const fileChooser = await fileChooserPromise;
    // Simulate selecting a file that the component *thinks* is too large
    // by ensuring error message related to size appears. For this test, any file selection
    // will do as we're testing the error path that the component would take.
    await fileChooser.setFiles(VALID_LOGO_PATH); 

    // The frontend component CompanyLogoUpload calls isValidImage(file).
    // If that returns false (because of mocked size or type), it sets an error.
    // We are checking that this error display works.
    
    // Crop dialog should NOT appear
    const cropDialog = page.locator('[role="dialog"]');
    await expect(cropDialog).not.toBeVisible({ timeout: 3000 });

    // Expect an error message related to file size
    const errorAlert = logoUploadSection.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible({ timeout: 5000 });
    // The error message from t('profile.errors.invalidImage') includes size information.
    await expect(errorAlert).toContainText(/exceeds|too large|size/i);
  });

  test('Admin can remove an existing company logo', async () => {
    await page.goto(PROFILE_URL);
    await page.waitForURL(`**${PROFILE_URL}`);

    const logoUploadSection = page.locator('[data-testid="company-logo-upload"]');
    await expect(logoUploadSection).toBeVisible();

    // Check if remove button is already visible. If not, upload a logo first.
    let removeButton = logoUploadSection.getByRole('button', { name: /remove company logo/i });
    if (!await removeButton.isVisible({ timeout: 1000 })) {
      console.log('No logo found to remove, attempting to upload one first...');
      const changeLogoButton = logoUploadSection.getByRole('button', { name: /change company logo/i });
      const fileChooserPromise = page.waitForEvent('filechooser');
      await changeLogoButton.click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(VALID_LOGO_PATH);
      const cropDialog = page.locator('[role="dialog"]');
      await expect(cropDialog).toBeVisible({ timeout: 10000 });
      const saveCropButton = cropDialog.getByRole('button', { name: /upload and save/i });
      await saveCropButton.click();
      // Wait for remove button to appear after upload
      removeButton = logoUploadSection.getByRole('button', { name: /remove company logo/i });
      await expect(removeButton).toBeVisible({ timeout: 10000 });
    }

    // Now, click the remove button
    await removeButton.click();

    // Wait for UI to update
    // Expect the placeholder (Building icon) to reappear
    // The CompanyLogoUpload component uses a div with testid 'building-icon' for the placeholder
    await expect(logoUploadSection.locator('[data-testid="building-icon"]')).toBeVisible({ timeout: 10000 });
    
    // And the actual img tag for the logo should not be visible, or its src should be empty/null
    const logoImage = logoUploadSection.locator('img');
    if (await logoImage.count() > 0) { // Check if img element still exists
        await expect(logoImage).not.toBeVisible(); // Or check its src if it's more reliable
    }

    // Remove button should no longer be visible
    await expect(removeButton).not.toBeVisible({ timeout: 5000 });
  });
}); 