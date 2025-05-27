import { randomBytes } from 'crypto';

/**
 * Generate a cryptographically secure token for invitations.
 */
export function generateInviteToken(): string {
  return randomBytes(32).toString('hex');
}
