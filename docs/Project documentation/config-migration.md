# Configuration System Migration Guide

This document explains how to migrate existing code to the new centralised configuration system introduced in the User Management module.

## Overview

The new system consolidates all runtime options and feature flags in `src/core/config`. Configuration values can be loaded from environment variables, optional JSON files and runtime overrides.

Key utilities:

- `loadUserManagementConfig` – merges configuration from the supported sources.
- `ConfigProvider` and `useUserManagementConfig` – React context for accessing configuration.
- `getServerConfig` / `getClientConfig` – helper functions for server and client environments.

## Migration Steps

1. **Remove hard‑coded values**
   - Replace direct references to constants such as API URLs, timeouts or redirect paths with values from `UserManagementConfiguration.getConfig()` or `useUserManagementConfig()`.
2. **Environment variables**
   - Define variables like `API_BASE_URL`, `API_TIMEOUT_MS` and `CSRF_HEADER_NAME` in your `.env` files.
3. **Optional config file**
   - Create `user-management.config.json` in your project root if you need to override defaults without environment variables.
4. **Runtime overrides**
   - Pass overrides to `loadUserManagementConfig()` when bootstrapping the application if dynamic values are required.
5. **Update middleware**
   - Middleware such as CORS should read allowed origins and header names from the configuration rather than using local constants.

Following these steps allows gradual migration while existing functionality continues to work using the default values.
