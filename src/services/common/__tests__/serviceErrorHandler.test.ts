import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import {
  logServiceError,
  handleServiceError,
  withErrorHandling,
  safeQuery,
  validateAndExecute,
  type ErrorContext,
} from '@/src/services/common/serviceErrorHandler'90;
import { ApplicationError } from '@/core/common/errors';
import { ERROR_CODES as CORE_ERROR_CODES } from '@/core/common/errorCodes'318;
import { ERROR_CODES as API_ERROR_CODES } from '@/lib/api/common/errorCodes'396;

const context: ErrorContext = { service: 'test', method: 'run', resourceType: 'item', resourceId: '1' };

describe('service-error-handler', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('logServiceError', () => {
    it('logs server errors with console.error', () => {
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const err = new ApplicationError(CORE_ERROR_CODES.INTERNAL_ERROR, 'boom', 500);
      logServiceError(err, context);
      expect(errSpy).toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('logs client errors with console.warn and redacts password', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const err = new ApplicationError(CORE_ERROR_CODES.USER_NOT_FOUND, 'bad', 404, {
        password: 'secret',
        foo: 'bar',
      });
      logServiceError(err, context);
      expect(warnSpy).toHaveBeenCalledWith(
        `[${context.service}.${context.method}] ${err.message}`,
        expect.objectContaining({
          code: err.code,
          resourceType: context.resourceType,
          resourceId: context.resourceId,
          details: { password: '***', foo: 'bar' },
        })
      );
    });
  });

  describe('handleServiceError', () => {
    it('returns existing ApplicationError', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const err = new ApplicationError(CORE_ERROR_CODES.USER_NOT_FOUND, 'oops', 404);
      const res = handleServiceError(err, context);
      expect(res.error).toBe(err);
      expect(warnSpy).toHaveBeenCalled();
    });

    it('wraps unknown error with default code and context', () => {
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const res = handleServiceError(new Error('fail'), context);
      expect(errSpy).toHaveBeenCalled();
      expect(res.error).toBeInstanceOf(ApplicationError);
      expect(res.error.code).toBe(CORE_ERROR_CODES.INTERNAL_ERROR);
      expect(res.error.message).toBe('fail');
      expect(res.error.details).toEqual({ context });
    });
  });

  describe('withErrorHandling', () => {
    it('returns value when resolved', async () => {
      const wrapped = withErrorHandling(async (x: number) => x * 2, context);
      await expect(wrapped(2)).resolves.toBe(4);
    });

    it('rethrows ApplicationError', async () => {
      const error = new ApplicationError(CORE_ERROR_CODES.USER_NOT_FOUND, 'nope', 404);
      const wrapped = withErrorHandling(async () => {
        throw error;
      }, context);
      await expect(wrapped()).rejects.toBe(error);
    });

    it('wraps generic error', async () => {
      const wrapped = withErrorHandling(async () => {
        throw new Error('boom');
      }, context);
      await expect(wrapped()).rejects.toBeInstanceOf(ApplicationError);
    });
  });

  describe('safeQuery', () => {
    it('returns result when query succeeds', async () => {
      const result = await safeQuery(async () => 3, 0, context);
      expect(result).toBe(3);
    });

    it('returns fallback when query fails', async () => {
      const warnSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await safeQuery(async () => {
        throw new Error('bad');
      }, 5, context);
      expect(result).toBe(5);
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  describe('validateAndExecute', () => {
    const schema = z.object({ name: z.string() });

    it('returns validation error result', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const res = await validateAndExecute({}, schema, async () => 'ok', context);
      expect((res as any).success).toBe(false);
      const err = (res as any).error;
      expect(err.code).toBe(API_ERROR_CODES.INVALID_REQUEST);
      expect(err.message).toBeDefined();
      expect(warnSpy).toHaveBeenCalled();
    });

    it('executes with validated data', async () => {
      const res = await validateAndExecute({ name: 'a' }, schema, async (d) => d.name.toUpperCase(), context);
      expect(res).toBe('A');
    });

    it('handles errors from function', async () => {
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const res = await validateAndExecute({ name: 'a' }, schema, async () => {
        throw new Error('fail');
      }, context);
      expect((res as any).success).toBe(false);
      const err = (res as any).error;
      expect(err.code).toBe(CORE_ERROR_CODES.INTERNAL_ERROR);
      expect(errSpy).toHaveBeenCalled();
    });
  });
});
