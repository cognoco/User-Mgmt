import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResourceRelationshipService } from '../resource-relationship.service';

type QueryResult = Promise<{ data: any; error: any }>;

describe('ResourceRelationshipService', () => {
  let db: any;
  let service: ResourceRelationshipService;

  beforeEach(() => {
    const single = vi.fn().mockResolvedValue({ data: { id: '1' }, error: null });
    const insert = vi.fn(() => ({ select: () => ({ single }) }));

    const eqFinal = vi.fn<QueryResult, []>(() => Promise.resolve({ data: [{ id: 1 }], error: null }));
    const eq = vi.fn(() => ({ eq: eqFinal }));
    const select = vi.fn(() => ({ eq }));
    const delMatch = vi.fn().mockResolvedValue({ error: null });
    const del = vi.fn(() => ({ match: delMatch }));

    db = { from: vi.fn((table: string) => ({ insert, select, delete: del })) };
    service = new ResourceRelationshipService(db);
  });

  it('creates relationship', async () => {
    const res = await service.createRelationship({
      parentType: 'org',
      parentId: 'p1',
      childType: 'team',
      childId: 'c1',
      relationshipType: 'member',
    });
    expect(db.from).toHaveBeenCalledWith('resource_relationships');
    expect(res).toEqual({ data: { id: '1' }, error: null });
  });

  it('gets parent resources', async () => {
    const result = await service.getParentResources('doc', 'd1');
    expect(db.from).toHaveBeenCalledWith('resource_relationships');
    expect(result).toEqual([{ id: 1 }]);
  });

  it('throws on getParentResources error', async () => {
    const eqFinal = vi.fn<QueryResult, []>(() => Promise.resolve({ data: null, error: { message: 'fail' } }));
    const eq = vi.fn(() => ({ eq: eqFinal }));
    const select = vi.fn(() => ({ eq }));
    db.from.mockReturnValueOnce({ select });
    await expect(service.getParentResources('x','y')).rejects.toEqual({ message: 'fail' });
  });

  it('gets child resources', async () => {
    const result = await service.getChildResources('org', 'o1');
    expect(result).toEqual([{ id: 1 }]);
  });

  it('throws on getChildResources error', async () => {
    const eqFinal = vi.fn<QueryResult, []>(() => Promise.resolve({ data: null, error: { message: 'oops' } }));
    const eq = vi.fn(() => ({ eq: eqFinal }));
    const select = vi.fn(() => ({ eq }));
    db.from.mockReturnValueOnce({ select });
    await expect(service.getChildResources('a','b')).rejects.toEqual({ message: 'oops' });
  });

  it('returns empty array when no child resources', async () => {
    const eqFinal = vi.fn<QueryResult, []>(() => Promise.resolve({ data: null, error: null }));
    const eq = vi.fn(() => ({ eq: eqFinal }));
    const select = vi.fn(() => ({ eq }));
    db.from.mockReturnValueOnce({ select });
    const res = await service.getChildResources('x', 'y');
    expect(res).toEqual([]);
  });

  it('deletes relationship', async () => {
    await service.deleteRelationship('org','o1','team','t1');
    expect(db.from).toHaveBeenCalledWith('resource_relationships');
  });
});
