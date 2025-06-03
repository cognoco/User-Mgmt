import { describe, it, expect } from 'vitest';
import { simulateError } from './error-simulator';

describe('simulateError', () => {
  it('throws with given message', () => {
    expect(() => simulateError('boom')).toThrowError('boom');
  });
});
