import { describe, it, expect } from 'vitest';
import { POST } from '../route';

describe('WebAuthn register API', () => {
  it('returns not implemented', async () => {
    const res = await POST();
    expect(res.status).toBe(501);
  });
});
