import { describe, it, expect, beforeEach } from 'vitest';
import { ApplicationError } from '@/core/common/errors';
import { ErrorClusterer } from '@/src/lib/telemetry/errorClustering';

describe('ErrorClusterer', () => {
  let clusterer: ErrorClusterer;

  beforeEach(() => {
    clusterer = new ErrorClusterer();
  });

  it('clusters similar error messages', () => {
    const e1 = new ApplicationError('E1' as any, 'Failed at step 1');
    const e2 = new ApplicationError('E1' as any, 'Failed at step 2');
    const e3 = new ApplicationError('E2' as any, 'Other issue');
    clusterer.addError(e1);
    clusterer.addError(e2);
    clusterer.addError(e3);

    const clusters = clusterer.getClusters();
    const c1 = clusters.find(c => c.id.startsWith('E1'))!;
    const c2 = clusters.find(c => c.id.startsWith('E2'))!;
    expect(c1.count).toBe(2);
    expect(c2.count).toBe(1);
  });
});
