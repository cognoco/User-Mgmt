import { describe, it, expect } from 'vitest';
import { simulateError } from '@/src/tests/utils/errorSimulator'48;

describe('simulateError', () => {
  it('throws with given message', () => {
    expect(() => simulateError('boom')).toThrowError('boom');
  });
});
