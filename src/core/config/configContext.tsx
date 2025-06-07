'use client';
import React, { createContext, useContext } from 'react';
import type { UserManagementConfig } from '@/src/core/config/interfaces';
import { DEFAULT_CONFIG } from '@/src/core/config/interfaces';

const ConfigContext = createContext<UserManagementConfig>(DEFAULT_CONFIG);

export const ConfigProvider = ConfigContext.Provider;

export function useUserManagementConfig(): UserManagementConfig {
  return useContext(ConfigContext);
}

export function getServerConfig(): UserManagementConfig {
  return DEFAULT_CONFIG;
}

export function getClientConfig(): Partial<UserManagementConfig> {
  const { serviceProviders, ...rest } = DEFAULT_CONFIG;
  return rest;
}

export default ConfigContext;
