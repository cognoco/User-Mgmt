# Vitest Configuration Backup (2025-05-14)

This directory contains a backup of the Vitest configuration files before upgrading from version 1.6.1 to 3.1.3.

## Files Included

- `vitest.config.ts` - Main Vitest configuration file
- `vitest.setup.ts` - Vitest setup file for global mocks and configurations
- `package.json` - Contains the dependency versions before the upgrade

## Current Test Commands

From package.json:
```json
"scripts": {
  "test": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:ui": "vitest --ui"
}
```

## Original Vitest Version

- vitest: ^1.2.2
- @vitest/coverage-v8: ^1.6.1

This backup was created on May 14, 2025 as part of the Vitest upgrade process. 