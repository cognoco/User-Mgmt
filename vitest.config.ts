/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'; // May cause error if not installed
import path from 'path';

export default defineConfig({
  plugins: [react() as any],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'], // Ensure this covers all test locations
    // Add coverage config if needed
    // coverage: {
    //   reporter: ['text', 'json', 'html'],
    //   exclude: [
    //     'node_modules/',
    //     'src/test/setup.ts',
    //     // Add other exclusions like .next/, config files etc.
    //     '.next/',
    //     '*.config.js',
    //     '*.config.mjs',
    //     '*.config.ts',
    //   ],
    // },
    alias: {
      // Replicate tsconfig paths
      '@': path.resolve(__dirname, './src'),
    },
    // Consider adding options for Next.js specific mocks if needed
    // environmentOptions: { ... }
  },
}); 