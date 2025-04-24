import type { User } from '@/types/user';

/**
 * Determines the homepage/dashboard route for a user based on company and individual preferences.
 * Falls back to /dashboard if no preference is set.
 *
 * Extend this logic as needed for more complex scenarios.
 */
export function getUserHomePage(user: User): string {
  // 1. Company-level homepage preference
  if (user.company && typeof user.company === 'object' && 'homepage' in user.company && user.company.homepage) {
    return user.company.homepage as string;
  }

  // 2. User-level homepage preference (metadata)
  if (user.metadata && typeof user.metadata === 'object' && user.metadata.homepage) {
    return user.metadata.homepage;
  }

  // 3. Fallback: default dashboard
  return '/dashboard';
}

/**
 * Default dashboard tiles (can be customized per company/user in the future)
 */
export const DEFAULT_DASHBOARD_TILES = [
  { key: 'account', label: 'My Account', path: '/settings/account' },
  { key: 'favorites', label: 'Favorites', path: '/favorites' },
  { key: 'recent', label: 'Recent Activity', path: '/activity' },
  { key: 'settings', label: 'Settings', path: '/settings' },
];
