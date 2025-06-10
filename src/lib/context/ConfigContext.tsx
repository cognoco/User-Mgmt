'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { ClientConfig, getClientConfig } from '@/core/config/clientConfig';

const ConfigContext = createContext<ClientConfig>(getClientConfig());

export const useRuntimeConfig = () => useContext(ConfigContext);

interface ConfigProviderProps {
  children: ReactNode;
  config?: Partial<ClientConfig>;
}

export function ConfigProvider({ children, config }: ConfigProviderProps) {
  const base = getClientConfig();
  const value = config ? { ...base, ...config } : base;
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}
