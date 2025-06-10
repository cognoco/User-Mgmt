export interface ProfileService {
  getProfileByUserId(userId: string): Promise<import('@/types/database').Profile | null>;
  updateProfileByUserId(userId: string, data: Partial<import('@/types/database').Profile>): Promise<import('@/types/database').Profile>;
}
