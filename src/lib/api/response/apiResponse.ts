export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export interface ResponseMeta {
  timestamp?: string;
  requestId?: string;
}

export function createSuccessResponse<T>(data: T, meta: ResponseMeta = {}): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: meta.timestamp || new Date().toISOString(),
      requestId: meta.requestId || '',
    },
  };
}

import type { ApplicationError } from '@/core/common/errors';

export function createErrorResponse(error: ApplicationError, meta: ResponseMeta = {}): ApiResponse<never> {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details }),
    },
    meta: {
      timestamp: meta.timestamp || error.timestamp || new Date().toISOString(),
      requestId: meta.requestId || '',
    },
  };
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export function createPaginatedResponse<T>(data: T[], pagination: PaginationMeta, meta: ResponseMeta = {}): ApiResponse<T[]> {
  return {
    success: true,
    data,
    meta: {
      timestamp: meta.timestamp || new Date().toISOString(),
      requestId: meta.requestId || '',
      pagination,
    } as any,
  };
}

export function createdResponse<T>(data: T, meta?: ResponseMeta): ApiResponse<T> {
  return createSuccessResponse(data, meta);
}

export function updatedResponse<T>(data: T, meta?: ResponseMeta): ApiResponse<T> {
  return createSuccessResponse(data, meta);
}
