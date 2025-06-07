import { describe, it, expect } from 'vitest';
import * as mod from '@/src/ui/styled/gdpr/ConsentManager';

describe('ConsentManager re-export', () => {
  it('exports component', () => {
    expect(mod).toHaveProperty('ConsentManager');
  });
});
