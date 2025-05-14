# Vitest Plugins and Configurations

This document details all custom plugins, configurations, and integrations used in the Vitest setup before upgrading from v1.6.1 to v3.1.3.

## Plugins

The project uses the following Vitest plugins:

1. **@vitejs/plugin-react**
   - Purpose: Provides React support in Vitest
   - Configuration: Loaded via `react()` in the plugins array

2. **vite-tsconfig-paths**
   - Purpose: Resolves TypeScript paths based on tsconfig.json
   - Configuration: Loaded via `tsconfigPaths()` in the plugins array

## Custom Configurations

### Path Aliases

The configuration uses path aliases to make imports cleaner:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, 'src'),
  },
}
```

### Test Environment

The project uses JSDOM as the test environment:

```typescript
test: {
  globals: true,
  environment: 'jsdom',
  // Other settings...
}
```

### Test File Patterns

Test files are identified using these patterns:

```typescript
include: [
  'src/**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}', 
  'src/tests/**/*.{test,spec,integration}.{js,jsx,ts,tsx}'
]
```

### File Exclusions

The following patterns are excluded from testing:

```typescript
exclude: [
  '**/node_modules/**',
  '**/dist/**',
  '**/.{idea,git,cache,output,temp}/**',
  '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}/**',
  '**/*[Ss]keleton*', 
]
```

### Setup Files

The project uses a custom setup file for global test configuration:

```typescript
setupFiles: ['./vitest.setup.ts']
```

## Global Mocks

The project has several global mocks defined in `vitest.setup.ts`:

1. **Fetch API**: Mocked with `vi.stubGlobal('fetch', fetchMock)`
2. **react-i18next**: Comprehensive mock for translation functions
3. **Axios**: Mock for API calls
4. **Auth Store**: Mock for authentication state
5. **Next.js Navigation**: Mock for router functions

## JSDOM Polyfills

Several browser APIs are polyfilled in the test environment:

1. **window.matchMedia**: For media query support
2. **ResizeObserver**: Required for UI components
3. **Various HTMLElement methods**: For DOM interaction
4. **File API**: File handling methods are mocked

## Notes for Upgrade

When upgrading to Vitest 3.1.3, pay special attention to these potential breaking changes:

1. Changes to the way plugins are loaded
2. Updates to mocking API and vi.stubGlobal usage
3. Changes to configuration structure
4. Different include/exclude pattern handling
5. Changes to global test context 