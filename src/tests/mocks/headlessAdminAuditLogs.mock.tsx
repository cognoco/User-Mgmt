import React from 'react';
import { vi } from 'vitest';

let errorState = false;
export function __setIsError(value: boolean) {
  errorState = value;
}

export function AdminAuditLogs({ children }: { children: (props: { isError: boolean; setIsError: (b: boolean) => void }) => React.ReactNode }) {
  return <>{children({ isError: errorState, setIsError: vi.fn() })}</>;
}
