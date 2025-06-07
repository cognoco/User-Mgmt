import { vi } from 'vitest';

const mockAccounts = [
  { id: 'personal', name: 'Personal Account', type: 'personal', avatar_url: 'https://example.com/avatar1.jpg' },
  { id: 'work', name: 'Work Account', type: 'organization', avatar_url: 'https://example.com/avatar2.jpg' },
  { id: 'client', name: 'Client Project', type: 'organization', avatar_url: 'https://example.com/avatar3.jpg' }
];

const mockMembers = [
  { id: 'member1', name: 'Test User', role: 'Admin' },
  { id: 'member2', name: 'Another User', role: 'Member' }
];

export const fetchAccounts = vi.fn().mockImplementation(() => {
  console.log('[TEST] fetchAccounts mock called');
  return Promise.resolve([...mockAccounts]);
});

export const switchAccount = vi.fn().mockResolvedValue(true);

export const createOrganization = vi.fn().mockImplementation((name, ownerId) => Promise.resolve({
  id: 'new-org-123',
  name,
  type: 'organization',
  avatar_url: null
}));

export const fetchOrganizationMembers = vi.fn().mockImplementation((orgId) => {
  // Make sure we always return a valid array
  if (orgId === 'work') {
    return Promise.resolve([...mockMembers]);
  }
  return Promise.resolve([]);
});

export const leaveOrganization = vi.fn().mockResolvedValue(true); 