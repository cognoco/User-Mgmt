// src/tests/utils/test-wrapper.tsx
import React from 'react';
import { setupTestServices } from './test-service-setup';

interface TestWrapperProps {
  children: React.ReactNode;
  customServices?: Record<string, any>;
}

export function TestWrapper({ children, customServices = {} }: TestWrapperProps) {
  // Setup services before rendering
  setupTestServices(customServices);
  
  return <>{children}</>;
}