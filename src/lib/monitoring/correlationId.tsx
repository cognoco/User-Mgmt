"use client";

import { v4 as uuidv4 } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';
import { isServer } from '@/core/platform';
import type { NextApiRequest, NextApiResponse } from 'next';
import React, { createContext, useContext } from 'react';

interface Store { correlationId: string; }

const asyncStorage: AsyncLocalStorage<Store> | undefined =
  isServer ? new AsyncLocalStorage<Store>() : undefined;

let clientCorrelationId: string | undefined;

const CorrelationIdContext = createContext<string | undefined>(undefined);

export interface CorrelationIdProviderProps {
  correlationId?: string;
  children: React.ReactNode;
}

export function CorrelationIdProvider({
  correlationId,
  children,
}: CorrelationIdProviderProps) {
  const id = correlationId ?? generateCorrelationId();
  setCorrelationId(id);
  return <CorrelationIdContext.Provider value={id}>{children}</CorrelationIdContext.Provider>;
}

export function useCorrelationId(): string | undefined {
  return useContext(CorrelationIdContext);
}

export function generateCorrelationId(parentId?: string): string {
  const id = uuidv4();
  return parentId ? `${parentId}.${id}` : id;
}

export function getCorrelationId(): string | undefined {
  if (isServer && asyncStorage) {
    return asyncStorage.getStore()?.correlationId;
  }
  return clientCorrelationId;
}

export function setCorrelationId(id: string) {
  if (isServer && asyncStorage) {
    asyncStorage.enterWith({ correlationId: id });
  } else {
    clientCorrelationId = id;
  }
}

export function runWithCorrelationId<T>(id: string, fn: () => T): T {
  if (isServer && asyncStorage) {
    return asyncStorage.run({ correlationId: id }, fn);
  }
  const previous = clientCorrelationId;
  clientCorrelationId = id;
  try {
    return fn();
  } finally {
    clientCorrelationId = previous;
  }
}

export function correlationIdMiddleware() {
  return async function (
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => Promise<void>
  ) {
    const parentId = getCorrelationId();
    const incomingId = (req.headers['x-correlation-id'] as string) || undefined;
    const id = incomingId || generateCorrelationId(parentId);

    setCorrelationId(id);
    (req as any).correlationId = id;
    res.setHeader('X-Correlation-Id', id);

    try {
      await runWithCorrelationId(id, async () => {
        await next();
      });
    } catch (error: any) {
      if (error && typeof error === 'object') {
        error.correlationId = id;
      }
      throw error;
    }
  };
}
