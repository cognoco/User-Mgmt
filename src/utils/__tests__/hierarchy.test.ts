import { describe, it, expect } from 'vitest';
import { isDescendant, validateParentSelection, HierarchyNode } from '@/utils/hierarchy';

const tree: HierarchyNode[] = [
  {
    id: 'root',
    children: [
      { id: 'child1', children: [ { id: 'subchild', children: [] } ] },
      { id: 'child2', children: [] },
    ],
  },
];

describe('hierarchy utils', () => {
  it('detects descendant relationship', () => {
    expect(isDescendant('root', 'child1', tree)).toBe(true);
    expect(isDescendant('child1', 'subchild', tree)).toBe(true);
    expect(isDescendant('child2', 'subchild', tree)).toBe(false);
  });

  it('validates parent selection', () => {
    // cannot set subchild as parent of root
    expect(validateParentSelection(tree, 'root', 'subchild')).toBe(false);
    // valid when selecting none
    expect(validateParentSelection(tree, 'child1', null)).toBe(true);
    // valid selection
    expect(validateParentSelection(tree, 'child2', 'root')).toBe(true);
  });
});
