/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'; // May cause error if not installed
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@simplewebauthn/server': path.resolve(
        __dirname,
        'src/tests/mocks/simplewebauthn-server.ts'
      ),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    // Aggressive timeouts to identify stuck tests
    testTimeout: 10000, // 10 seconds max per test
    hookTimeout: 5000,  // 5 seconds for setup/teardown
    teardownTimeout: 5000,
    // Pool configuration for better resource management
    pool: 'threads',
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 1,
        isolate: true
      }
    },
    // Better error reporting
    reporter: ['verbose', 'json'],
    outputFile: 'test-results.json',
    include: [
      'src/**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'src/tests/**/*.{test,spec,integration}.{js,jsx,ts,tsx}',
      'app/**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}'
    ],
    exclude: [
      // Default excludes (keep these)
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}/**',

      // --- Add this line ---
      '**/*[Ss]keleton*', 
      // --- Or potentially more specific ---
      // '**/*[Ss]keleton*.test.{ts,tsx}',

      // Explicitly exclude all e2e tests
      '**/e2e/**',
    ],
  },
}); 