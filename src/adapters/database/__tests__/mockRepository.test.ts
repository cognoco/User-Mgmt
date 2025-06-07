import { describe, it, expect } from 'vitest';
import { MockRepository } from '@/src/adapters/database/mock'48;

interface Item { id: string; name: string; type?: string }

describe('MockRepository', () => {
  it('supports basic CRUD operations', async () => {
    const repo = new MockRepository<Item>();
    await repo.connect();

    const created = await repo.create({ name: 'test' });
    expect(created).toHaveProperty('id');

    const found = await repo.findById(created.id);
    expect(found?.name).toBe('test');

    const updated = await repo.update(created.id, { name: 'updated' });
    expect(updated.name).toBe('updated');

    const del = await repo.delete(created.id);
    expect(del.success).toBe(true);
    const missing = await repo.findById(created.id);
    expect(missing).toBeNull();
  });

  it('filters results via query', async () => {
    const repo = new MockRepository<Item>();
    await repo.connect();
    await repo.create({ name: 'a', type: 'one' });
    await repo.create({ name: 'b', type: 'two' });

    const res = await repo.query({ filters: [{ field: 'type', operator: '=', value: 'one' }] });
    expect(res.items.length).toBe(1);
    expect(res.items[0].name).toBe('a');
  });
});
