# Vitest Test Commands Documentation

This document captures all test commands and configurations used in the project before upgrading Vitest from v1.6.1 to v3.1.3.

## NPM Scripts

The following test commands are defined in `package.json`:

```json
"scripts": {
  "test": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:ui": "vitest --ui"
}
```

## Command Usage

### Running Tests in Watch Mode
```bash
npm test
# or
npm run test
# or
npx vitest
```

### Running Tests Once (CI Mode)
```bash
npm test -- --run
# or
npx vitest run
```

### Running Tests with Coverage
```bash
npm run test:coverage
# or
npx vitest run --coverage
```

### Running Tests with UI
```bash
npm run test:ui
# or
npx vitest --ui
```

### Running Specific Tests
```bash
# Run tests in a specific file
npm test -- src/tests/integration/auth.test.tsx

# Run tests matching a name pattern
npm test -- -t "authentication flow"
```

## Vitest Configuration

The Vitest configuration is defined in `vitest.config.ts`. Key settings include:

- Test environment: jsdom
- Setup files: `./vitest.setup.ts`
- Test file pattern: `src/**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}` and `src/tests/**/*.{test,spec,integration}.{js,jsx,ts,tsx}`
- Exclusion patterns for test files that should be ignored

## Environment Variables

No specific environment variables are required exclusively for running tests, but the following are set in the test setup files:

```javascript
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'; // Dummy URL
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dummy-anon-key'; // Dummy key
``` 