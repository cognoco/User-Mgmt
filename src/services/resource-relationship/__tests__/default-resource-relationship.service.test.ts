import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DefaultResourceRelationshipService } from '../default-resource-relationship.service';
import type { IResourceRelationshipDataProvider } from '@/core/resource-relationship/IResourceRelationshipDataProvider';

const relationship = {
  id: '1',
  parentType: 'project',
  parentId: 'p1',
  childType: 'task',
  childId: 't1',
  relationshipType: 'contains',
};

describe('DefaultResourceRelationshipService', () => {
  let provider: IResourceRelationshipDataProvider;
  let service: DefaultResourceRelationshipService;

  beforeEach(() => {
    provider = {
      createRelationship: vi.fn().mockResolvedValue(relationship),
      getChildRelationships: vi.fn().mockResolvedValue([relationship]),
      getParentRelationships: vi.fn().mockResolvedValue([relationship]),
      removeRelationship: vi.fn().mockResolvedValue(true),
    };
    service = new DefaultResourceRelationshipService(provider);
  });

  it('creates relationship', async () => {
    const res = await service.createRelationship({
      parentType: 'project',
      parentId: 'p1',
      childType: 'task',
      childId: 't1',
      relationshipType: 'contains',
      createdBy: 'u1',
    });
    expect(res).toEqual(relationship);
    expect(provider.createRelationship).toHaveBeenCalled();
  });

  it('gets children', async () => {
    const res = await service.getChildResources('project', 'p1');
    expect(res).toEqual([relationship]);
    expect(provider.getChildRelationships).toHaveBeenCalledWith('project', 'p1');
  });

  it('gets parents', async () => {
    const res = await service.getParentResources('task', 't1');
    expect(res).toEqual([relationship]);
    expect(provider.getParentRelationships).toHaveBeenCalledWith('task', 't1');
  });

  it('removes relationship', async () => {
    const ok = await service.removeRelationship('project', 'p1', 'task', 't1');
    expect(ok).toBe(true);
    expect(provider.removeRelationship).toHaveBeenCalledWith('project', 'p1', 'task', 't1');
  });
});
