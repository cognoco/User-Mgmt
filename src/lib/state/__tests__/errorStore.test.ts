import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useErrorStore } from '../errorStore';
import { act } from '@testing-library/react';

vi.mock('@/lib/audit/error-logger', () => ({
  logApiError: vi.fn(),
}));

const { logApiError } = await import('@/lib/audit/error-logger');

describe('errorStore', () => {
  beforeEach(() => {
    act(() => {
      useErrorStore.setState({ globalQueue: [], sectionQueues: {}, history: [] });
    });
    vi.clearAllMocks();
  });

  it('adds and removes global errors', () => {
    let id: string = '';
    act(() => {
      id = useErrorStore.getState().addError({ message: 'oops', dismissAfter: 0 });
    });
    expect(useErrorStore.getState().globalQueue[0]).toEqual(expect.objectContaining({ message: 'oops' }));

    act(() => {
      useErrorStore.getState().removeError(id);
    });
    expect(useErrorStore.getState().globalQueue.length).toBe(0);
  });

  it('handles section specific errors', () => {
    act(() => {
      useErrorStore.getState().addError({ message: 'auth', section: 'auth', dismissAfter: 0 });
    });
    const errors = useErrorStore.getState().sectionQueues['auth'] || [];
    expect(errors.length).toBe(1);
    expect(errors[0].message).toBe('auth');
  });

  it('auto dismisses errors', async () => {
    act(() => {
      useErrorStore.getState().addError({ message: 'temp', dismissAfter: 10 });
    });
    expect(useErrorStore.getState().globalQueue.length).toBe(1);
    await new Promise(res => setTimeout(res, 15));
    expect(useErrorStore.getState().globalQueue.length).toBe(0);
  });

  it('tracks error types and syncing', () => {
    act(() => {
      useErrorStore.getState().addError({ message: 'sync', type: 'NETWORK', sync: true });
    });
    expect(useErrorStore.getState().globalQueue.some(e => e.type === 'NETWORK')).toBe(true);
    expect(logApiError).toHaveBeenCalled();
  });

  it('clears errors by section', () => {
    act(() => {
      useErrorStore.getState().addError({ message: 'a', section: 'auth', dismissAfter: 0 });
      useErrorStore.getState().addError({ message: 'b', section: 'billing', dismissAfter: 0 });
      useErrorStore.getState().clearErrors('auth');
    });
    expect((useErrorStore.getState().sectionQueues['auth'] || []).length).toBe(0);
    expect((useErrorStore.getState().sectionQueues['billing'] || []).length).toBe(1);
  });
});
