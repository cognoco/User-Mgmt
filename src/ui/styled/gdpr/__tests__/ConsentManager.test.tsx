import { describe, it, expect } from 'vitest';
import * as mod from '../ConsentManager';

describe('ConsentManager re-export', () => {
  it('exports component', () => {
    expect(mod).toHaveProperty('ConsentManager');
  });
});
