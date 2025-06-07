/**
 * API Common Utilities
 * 
 * This file exports all common utilities for API routes.
 */

export * from '@/lib/api/common/errorCodes';
export * from '@/lib/api/common/apiError';
export * from '@/lib/api/common/responseFormatter';
export * from '@/lib/api/errorHandler';

// Re-export middleware functions for convenience
export { withErrorHandling } from '@/middleware/errorHandling';
export { withValidation } from '@/middleware/validation';
