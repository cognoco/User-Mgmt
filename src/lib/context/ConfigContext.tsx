'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { RuntimeConfig, getClientConfig } from '@/core/config/runtimeConfig'85;

const ConfigContext = createContext<RuntimeConfig>(getClientConfig());

export const useRuntimeConfig = () => useContext(ConfigContext);

interface ConfigProviderProps {
  children: ReactNode;
  config?: Partial<RuntimeConfig>;
}

export function ConfigProvider({ children, config }: ConfigProviderProps) {
  const base = getClientConfig();
  const value = config ? { ...base, ...config } : base;
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}
