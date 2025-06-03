import { describe, it, expect, beforeEach } from 'vitest';
import { ErrorCodeRegistry, ErrorSeverity } from '../error-code-registry';

describe('ErrorCodeRegistry', () => {
  beforeEach(() => {
    ErrorCodeRegistry.clear();
  });

  it('registers and retrieves codes', () => {
    ErrorCodeRegistry.register('TEST_001', 'test error', 'medium');
    const info = ErrorCodeRegistry.get('TEST_001');
    expect(info).toEqual({ code: 'TEST_001', description: 'test error', severity: 'medium' });
    expect(ErrorCodeRegistry.has('TEST_001')).toBe(true);
  });

  it('prevents duplicate registration', () => {
    ErrorCodeRegistry.register('DUP_001', 'one', 'low');
    expect(() => ErrorCodeRegistry.register('DUP_001', 'two', 'high')).toThrow(/already registered/);
  });

  it('lists all codes', () => {
    ErrorCodeRegistry.register('A', 'a', 'low');
    ErrorCodeRegistry.register('B', 'b', 'high');
    const list = ErrorCodeRegistry.list();
    expect(list).toHaveLength(2);
  });
});
