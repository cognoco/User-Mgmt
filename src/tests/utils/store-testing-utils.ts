import { useAuthStore } from '@/lib/stores/auth.store';
import { useUserStore } from '@/lib/stores/user.store';
import { use2FAStore } from '@/lib/stores/2fa.store';
import { useCompanyProfileStore } from '@/lib/stores/companyProfileStore';
import { useSubscriptionStore } from '@/lib/stores/subscription.store';
import { useProfileStore } from '@/lib/stores/profile.store';
import { usePreferencesStore } from '@/lib/stores/preferences.store';

export function resetStores() {
  useAuthStore.getState().reset();
  useUserStore.getState().reset();
  use2FAStore.getState().reset();
  useCompanyProfileStore.getState().reset();
  useSubscriptionStore.getState().reset();
  useProfileStore.getState().reset();
  usePreferencesStore.getState().reset();
}
