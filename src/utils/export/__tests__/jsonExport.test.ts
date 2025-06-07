import { describe, it, expect } from 'vitest';
import { formatJSONForExport } from '@/src/utils/export/jsonExport';

describe('formatJSONForExport', () => {
  it('formats pretty json by default', () => {
    const data = [{ id: 1 }];
    const json = formatJSONForExport(data);
    expect(json).toBe(JSON.stringify(data, null, 2));
  });

  it('applies transform and no pretty', () => {
    const data = [{ id: 1 }];
    const json = formatJSONForExport(data, {
      pretty: false,
      transform: (item) => ({ id: item.id + 1 })
    });
    expect(json).toBe(JSON.stringify([{ id: 2 }]));
  });
});
