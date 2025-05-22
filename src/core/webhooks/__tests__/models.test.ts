import { describe, it, expect } from 'vitest';
import { webhookCreateSchema, webhookUpdateSchema } from '../models';

describe('webhook schemas', () => {
  it('validates create payload', () => {
    const result = webhookCreateSchema.parse({
      name: 'My Hook',
      url: 'https://example.com',
      events: ['user.created']
    });
    expect(result.isActive).toBe(true);
  });

  it('rejects invalid create payload', () => {
    expect(() =>
      webhookCreateSchema.parse({ name: '', url: 'bad', events: [] })
    ).toThrow();
  });

  it('allows partial update payload', () => {
    const payload = webhookUpdateSchema.parse({ name: 'New', isActive: false });
    expect(payload.name).toBe('New');
    expect(payload.isActive).toBe(false);
  });
});
