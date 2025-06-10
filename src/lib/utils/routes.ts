/**
 * User Management Module - Routing Constants
 * 
 * This file defines all routes used in the application, following the standardized
 * structure of app/[SECTION]/[DOMAIN]/page.tsx for pages and api/[DOMAIN]/[RESOURCE]/route.ts for API endpoints.
 * 
 * Using these constants instead of hardcoded strings ensures consistency and makes
 * refactoring easier when routes need to change.
 */

// ==============================
// Page Routes
// ==============================

/**
 * Page route constants organized by section and domain
 */
export const ROUTES = {
  // Home section
  HOME: {
    OVERVIEW: '/home/overview',
  },

  // Auth section
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    RESET_PASSWORD: '/auth/reset-password',
    UPDATE_PASSWORD: '/auth/update-password',
    VERIFY_EMAIL: '/auth/verify-email',
    CHECK_EMAIL: '/auth/check-email',
    CALLBACK: '/auth/callback',
  },

  // Account section
  ACCOUNT: {
    PROFILE: '/account/profile',
    BILLING: '/account/billing',
    COMPLETE_PROFILE: '/account/complete-profile',
  },

  // Dashboard section
  DASHBOARD: {
    OVERVIEW: '/dashboard/overview',
  },

  // Settings section
  SETTINGS: {
    OVERVIEW: '/settings/overview',
    ACTIVITY: '/settings/activity',
    API_KEYS: '/settings/api-keys',
    SECURITY: '/settings/security',
    SESSIONS: '/settings/sessions',
  },

  // Teams section
  TEAMS: {
    OVERVIEW: '/teams/overview',
    MANAGE: '/teams/manage',
    INVITATIONS: '/teams/invitations',
    ADDRESSES: '/teams/addresses',
    WEBHOOKS: '/teams/webhooks',
  },

  // Admin section
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    AUDIT_LOGS: '/admin/audit-logs',
    GDPR: '/admin/gdpr',
    PERMISSIONS: '/admin/permissions',
    ROLES: '/admin/roles',
    ORGANIZATIONS: {
      SETTINGS: (orgId: string) => `/admin/organizations/${orgId}/settings`,
      SSO: (orgId: string) => `/admin/organizations/${orgId}/settings/sso`,
    },
  },

  // Company section
  COMPANY: {
    PROFILE: '/company/profile',
    ADDRESSES: '/company/addresses',
  },

  // Demo section
  DEMO: {
    RESPONSIVE: '/demo/responsive',
  },
};

// ==============================
// API Routes
// ==============================

/**
 * API route constants organized by domain and resource
 */
export const API_ROUTES = {
  // Auth domain
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGIN_MFA_CHECK: '/api/auth/login/mfa-check',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    RESET_PASSWORD: '/api/auth/reset-password',
    UPDATE_PASSWORD: '/api/auth/update-password',
    SEND_VERIFICATION_EMAIL: '/api/auth/send-verification-email',
    ACCOUNT: '/api/auth/account',
    CSRF: '/api/auth/csrf',
    MFA: {
      VERIFY: '/api/auth/mfa/verify',
      RESEND_EMAIL: '/api/auth/mfa/resend-email',
      RESEND_SMS: '/api/auth/mfa/resend-sms',
    },
    OAUTH: {
      BASE: '/api/auth/oauth',
      CALLBACK: '/api/auth/oauth/callback',
      LINK: '/api/auth/oauth/link',
      DISCONNECT: '/api/auth/oauth/disconnect',
    },
  },

  // Two-factor authentication domain
  TWO_FACTOR: {
    SETUP: '/api/2fa/setup',
    DISABLE: '/api/2fa/disable',
    VERIFY: '/api/2fa/verify',
    RESEND_EMAIL: '/api/2fa/resend-email',
    BACKUP_CODES: '/api/2fa/backup-codes',
    BACKUP_CODES_VERIFY: '/api/2fa/backup-codes/verify',
  },

  // User profile domain
  PROFILE: {
    BASE: '/api/profile',
    AVATAR: '/api/profile/avatar',
    PASSWORD: '/api/profile/password',
    EMAIL: '/api/profile/email',
    PHONE: '/api/profile/phone',
    PREFERENCES: '/api/profile/preferences',
    NOTIFICATIONS: '/api/profile/notifications',
    DELETE: '/api/profile/delete',
    EXPORT: '/api/profile/export',
  },

  // Team domain
  TEAM: {
    BASE: '/api/team',
    MEMBERS: '/api/team/members',
    MEMBER: (memberId: string) => `/api/team/members/${memberId}`,
    INVITATIONS: '/api/team/invitations',
    INVITATION: (inviteId: string) => `/api/team/invitations/${inviteId}`,
    ROLES: '/api/team/roles',
    ROLE: (roleId: string) => `/api/team/roles/${roleId}`,
    PERMISSIONS: '/api/team/permissions',
  },

  // Address domain
  ADDRESSES: {
    BASE: '/api/addresses',
    ADDRESS: (addressId: string) => `/api/addresses/${addressId}`,
    DEFAULT: (addressId: string) => `/api/addresses/default/${addressId}`,
    VALIDATE: '/api/address/validate',
  },

  // API keys domain
  API_KEYS: {
    BASE: '/api/api-keys',
    KEY: (keyId: string) => `/api/api-keys/${keyId}`,
  },

  // Audit domain
  AUDIT: {
    USER_ACTIONS: '/api/audit/user-actions',
    PERMISSION_EXPORT: '/api/audit/permission/export',
  },

  // Admin domain
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    AUDIT: '/api/admin/audit',
    EXPORT: '/api/admin/export',
    USERS: '/api/admin/users',
    USER: (userId: string) => `/api/admin/users/${userId}`,
  },

  // Company domain
  COMPANY: {
    PROFILE: '/api/company/profile',
    ADDRESSES: {
      BASE: '/api/company/addresses',
      ADDRESS: (addressId: string) => `/api/company/addresses/${addressId}`,
    },
    DOCUMENTS: {
      BASE: '/api/company/documents',
      DOCUMENT: (documentId: string) => `/api/company/documents/${documentId}`,
    },
    DOMAINS: {
      BASE: '/api/company/domains',
      DOMAIN: (domainId: string) => `/api/company/domains/${domainId}`,
    },
    NOTIFICATIONS: {
      PREFERENCES: {
        BASE: '/api/company/notifications/preferences',
        PREFERENCE: (id: string) => `/api/company/notifications/preferences/${id}`,
      },
      RECIPIENTS: {
        BASE: '/api/company/notifications/recipients',
        RECIPIENT: (id: string) => `/api/company/notifications/recipients/${id}`,
      },
    },
    VALIDATE: {
      BASE: '/api/company/validate',
      REGISTRATION: '/api/company/validate/registration',
      TAX: '/api/company/validate/tax',
    },
    VERIFY_DOMAIN: {
      INITIATE: '/api/company/verify-domain/initiate',
      CHECK: '/api/company/verify-domain/check',
    },
  },

  // CSRF protection domain
  CSRF: {
    TOKEN: '/api/csrf',
  },

  // GDPR compliance domain
  GDPR: {
    DATA_EXPORT: '/api/gdpr/data-export',
    DATA_DELETION: '/api/gdpr/data-deletion',
  },

  // Notifications domain
  NOTIFICATIONS: {
    BASE: '/api/notifications',
  },

  // Organizations domain
  ORGANIZATIONS: {
    BASE: '/api/organizations',
    ORGANIZATION: (orgId: string) => `/api/organizations/${orgId}`,
    MEMBERS: {
      BASE: (orgId: string) => `/api/organizations/${orgId}/members`,
      MEMBER: (orgId: string, memberId: string) => `/api/organizations/${orgId}/members/${memberId}`,
    },
    INVITATIONS: {
      BASE: (orgId: string) => `/api/organizations/${orgId}/invitations`,
      INVITATION: (orgId: string, inviteId: string) => `/api/organizations/${orgId}/invitations/${inviteId}`,
    },
  },

  // Permissions domain
  PERMISSIONS: {
    BASE: '/api/permissions',
    ROLES: '/api/permissions/roles',
  },

  // Preferences domain
  PREFERENCES: {
    BASE: '/api/preferences',
  },

  // Session management domain
  SESSION: {
    BASE: '/api/session',
    ACTIVE: '/api/session/active',
    REVOKE: '/api/session/revoke',
  },

  // Settings domain
  SETTINGS: {
    BASE: '/api/settings',
  },

  // SSO domain
  SSO: {
    CONFIGURE: '/api/sso/configure',
    LOGIN: '/api/sso/login',
  },

  // Subscription management domain
  SUBSCRIPTION: {
    BASE: '/api/subscriptions',
    PLANS: '/api/subscriptions/plans',
    STATUS: '/api/subscriptions/status',
    CHECKOUT: '/api/subscriptions/checkout',
    PORTAL: '/api/subscriptions/portal',
    CANCEL: '/api/subscriptions/cancel',
  },

  // Tax ID domain
  TAX_ID: {
    BASE: '/api/tax-id',
    VALIDATE: '/api/tax-id/validate',
  },

  // Webhooks domain
  WEBHOOKS: {
    BASE: '/api/webhooks',
    WEBHOOK: (webhookId: string) => `/api/webhooks/${webhookId}`,
    EVENTS: '/api/webhooks/events',
    LOGS: '/api/webhooks/logs',
    LOG: (logId: string) => `/api/webhooks/logs/${logId}`,
    DELIVER: (webhookId: string) => `/api/webhooks/${webhookId}/deliver`,
    TEST: '/api/webhooks/test',
  },
};

/**
 * Helper function to generate the full URL for a route
 * @param route The route path
 * @returns The full URL including the base URL
 */
export function getFullUrl(route: string): string {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || '';
  
  return `${baseUrl}${route}`;
}

/**
 * Helper function to navigate to a route
 * @param route The route to navigate to
 * @param options Navigation options
 */
export function navigateTo(route: string, options?: { replace?: boolean }): void {
  if (typeof window !== 'undefined') {
    if (options?.replace) {
      window.location.replace(route);
    } else {
      window.location.href = route;
    }
  }
}
