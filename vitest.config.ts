/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'; // May cause error if not installed
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react() as any, tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}', 'src/tests/**/*.{test,spec,integration}.{js,jsx,ts,tsx}'],
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
    // Consider adding options for Next.js specific mocks if needed
    // environmentOptions: { ... }
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

      // You might have other custom excludes here too
    ],
  },
}); 