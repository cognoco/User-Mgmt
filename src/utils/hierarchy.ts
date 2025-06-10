export interface HierarchyNode {
  id: string;
  children: HierarchyNode[];
}

function findNode(nodes: HierarchyNode[], id: string): HierarchyNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findNode(n.children, id);
    if (found) return found;
  }
  return null;
}

function contains(node: HierarchyNode | null, targetId: string): boolean {
  if (!node) return false;
  if (node.id === targetId) return true;
  return node.children.some((c) => contains(c, targetId));
}

export function isDescendant(parentId: string, childId: string, tree: HierarchyNode[]): boolean {
  const parent = findNode(tree, parentId);
  return contains(parent, childId);
}

export function validateParentSelection(
  tree: HierarchyNode[],
  childRoleId: string,
  parentRoleId: string | null,
): boolean {
  if (!parentRoleId) return true;
  return !isDescendant(childRoleId, parentRoleId, tree);
}
