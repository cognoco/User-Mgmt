import { describe, it, expect } from 'vitest';
import { objectsToCSV } from '@/utils/export/csvExport';

describe('objectsToCSV', () => {
  it('converts objects to csv with headers', () => {
    const data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ];
    const csv = objectsToCSV(data);
    const lines = csv.split('\n');
    expect(lines[0]).toBe('"Id","Name"');
    expect(lines[1]).toBe('"1","Alice"');
    expect(lines[2]).toBe('"2","Bob"');
  });

  it('uses column config and formatter', () => {
    const data = [{ created: '2020-01-01T00:00:00Z' }];
    const csv = objectsToCSV(data, [
      { key: 'created', header: 'Created', format: (v) => new Date(v).toDateString() }
    ]);
    expect(csv.trim()).toBe(`"Created"\n"${new Date('2020-01-01T00:00:00Z').toDateString()}"`);
  });
});
