import { create } from 'zustand';
import { api } from '@/lib/api/axios';
import type { UserPreferences } from '@/types/database';
import { useAuth } from '@/lib/hooks/useAuth'; // To ensure user is authenticated

export interface PreferencesState {
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (data: Partial<UserPreferences>) => Promise<boolean>; // Return true on success, false on error
}

type PreferencesInternalState = Omit<PreferencesState, 'fetchPreferences' | 'updatePreferences'> & {
  fetchPreferences: (userId: string | undefined) => Promise<void>;
  updatePreferences: (userId: string | undefined, data: Partial<UserPreferences>) => Promise<boolean>;
};

const preferencesStoreBase = create<PreferencesInternalState>((set) => ({
  preferences: null,
  isLoading: false,
  error: null,

  fetchPreferences: async (userId: string | undefined) => {
    if (!userId) {
      // Don't set error, maybe just log or handle silently 
      // as this might be called when user is not logged in yet.
      // set({ error: 'User not authenticated for preferences' }); 
      console.warn('Attempted to fetch preferences without authenticated user.');
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/preferences');
      set({ preferences: response.data as UserPreferences, isLoading: false });
    } catch (error: any) {
      console.error("Fetch preferences error:", error);
      set({
        error: error.response?.data?.error || 'Failed to fetch preferences',
        isLoading: false,
      });
    }
  },

  updatePreferences: async (userId: string | undefined, data: Partial<UserPreferences>): Promise<boolean> => {
    if (!userId) {
       set({ error: 'User not authenticated to update preferences' });
       return false;
    }
    
    // Create updateData by copying payload and deleting immutable fields
    const updateData = { ...data };
    delete updateData.userId; 
    delete updateData.id;
    delete updateData.createdAt; // Also prevent updating timestamps
    delete updateData.updatedAt;
    
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch('/api/preferences', updateData);
      
      set((state) => ({
        preferences: state.preferences 
          ? { ...state.preferences, ...response.data } 
          : response.data as UserPreferences,
        isLoading: false
      }));
      return true;
    } catch (error: any) {
      console.error("Update preferences error:", error);
      set({
        error: error.response?.data?.error || 'Failed to update preferences',
        isLoading: false,
      });
      return false;
    }
  },
}));

export function usePreferencesStore(): PreferencesState {
  const store = preferencesStoreBase();
  const { user } = useAuth();

  return {
    ...store,
    fetchPreferences: () => store.fetchPreferences(user?.id),
    updatePreferences: (data) => store.updatePreferences(user?.id, data),
  };
}
