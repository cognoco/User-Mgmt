import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Correct ESM path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load variables from the root .env file so e2e tests
// always share the same configuration
dotenv.config({ path: path.resolve(__dirname, '.env') });
import { defineConfig, devices } from '@playwright/test';

// Use real Supabase by default since credentials are configured
const useRealSupabase = process.env.E2E_USE_SUPABASE !== 'false'; // Default to true

// Configure base URL with environment variable support
const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';

console.log(`Playwright E2E Config: Using baseURL=${baseURL}`);
console.log(`Set E2E_BASE_URL environment variable to override (e.g., E2E_BASE_URL=http://localhost:3003)`);

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  retries: 0, // No retries - fail fast for debugging
  workers: 1, // Single worker for debugging
  globalSetup: './e2e/utils/global-setup.ts',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Reduce timeouts for faster failure
    navigationTimeout: 10000,
    actionTimeout: 5000,
  },
  // No webServer config - use the existing dev server
  projects: [
    {
      name: 'Desktop Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        // Override timeouts for this project too
        navigationTimeout: 10000,
        actionTimeout: 5000,
      },
    },
    // Comment out other browsers for faster debugging
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Desktop Firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'Desktop Safari',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  reporter: [['list'], ['html', { open: 'never' }]],
}); 