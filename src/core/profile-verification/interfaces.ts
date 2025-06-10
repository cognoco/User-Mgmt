import type { ProfileVerification } from '@/types/profile';

export interface ProfileVerificationService {
  /** Fetch verification status for a user */
  getStatus(userId: string): Promise<ProfileVerification>;

  /** Request verification, optionally with a document */
  requestVerification(
    userId: string,
    document?: File
  ): Promise<ProfileVerification>;
}
