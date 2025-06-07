import { describe, it, expect } from 'vitest';
import { simulateError } from '@/tests/utils/errorSimulator';

describe('simulateError', () => {
  it('throws with given message', () => {
    expect(() => simulateError('boom')).toThrowError('boom');
  });
});
