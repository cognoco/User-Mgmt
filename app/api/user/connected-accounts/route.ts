// Deprecated alias for connected accounts endpoints
// GET & DELETE handled by /api/connected-accounts
// POST handled by /api/auth/oauth/link
export { GET, DELETE } from '@/app/api/connectedAccounts/route';
export { POST } from '@/app/api/auth/oauth/link/route';
