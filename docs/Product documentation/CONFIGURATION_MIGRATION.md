# Configuration System Migration Guide

This document explains how to transition existing code to the new centralized configuration system.

1. **Create a `user-management.config.ts` file** in the project root. This file exports a partial configuration object that can override defaults loaded from environment variables.
2. **Load configuration early** in your application by calling `initializeConfiguration()` from `@/core/config/runtime-config`.
3. **Replace direct imports** of `apiConfig`, `supabaseConfig`, and similar objects with calls to `getConfig()` or the `useRuntimeConfig()` hook.
4. **Update API clients** to use values from `getConfig().env` rather than hard-coded strings.
5. **Provide runtime overrides** by passing a `config` object to the `ConfigProvider` when wrapping your application.

Migrating gradually is safe because the old exports remain available. Start by reading configuration from `getConfig()` in new code, then refactor existing modules as time permits.
