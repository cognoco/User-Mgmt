import { create } from 'zustand';
import { CompanyProfile, CompanyAddress, AddressType } from '@/types/company';

interface CompanyProfileState {
  profile: CompanyProfile | null;
  addresses: CompanyAddress[];
  isLoading: boolean;
  error: Error | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<CompanyProfile>) => Promise<void>;
  addAddress: (address: Omit<CompanyAddress, 'id'>) => Promise<void>;
  updateAddress: (id: string, data: Partial<CompanyAddress>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
}

export const useCompanyProfileStore = create<CompanyProfileState>((set, get) => ({
  profile: null,
  addresses: [],
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Fetch profile
      const profileRes = await fetch('/api/company/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!profileRes.ok) {
        throw new Error('Failed to fetch company profile');
      }

      const profile = await profileRes.json();

      // Fetch addresses
      const addressesRes = await fetch('/api/company/addresses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!addressesRes.ok) {
        throw new Error('Failed to fetch company addresses');
      }

      const addresses = await addressesRes.json();

      set({ profile, addresses, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('An error occurred'), 
        isLoading: false 
      });
    }
  },

  updateProfile: async (data) => {
    // Separate address from the main profile data
    const { address, ...profileData } = data;
    let primaryAddressId: string | null = null;

    try {
      set({ isLoading: true, error: null });

      // 1. Update the main profile data
      const profileRes = await fetch('/api/company/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!profileRes.ok) {
        throw new Error('Failed to update company profile');
      }
      const updatedProfile = await profileRes.json();

      // 2. Handle the address update/creation
      let updatedAddresses = get().addresses;
      if (address && Object.keys(address).length > 0) {
        // Find existing primary address ID using is_primary flag
        const existingPrimary = get().addresses.find(addr => addr.is_primary);
        primaryAddressId = existingPrimary?.id || null;

        // Set is_primary to true and use a valid AddressType (e.g., 'legal')
        const addressPayload = { ...address, is_primary: true, type: 'legal' as AddressType };

        if (primaryAddressId) {
          // Update existing primary address
          const addressRes = await fetch(`/api/company/addresses/${primaryAddressId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(addressPayload),
          });
          if (!addressRes.ok) throw new Error('Failed to update primary address');
          const updatedAddress = await addressRes.json();
          updatedAddresses = get().addresses.map(addr => addr.id === primaryAddressId ? updatedAddress : addr);
        } else {
          // Add new primary address
          const addressRes = await fetch('/api/company/addresses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(addressPayload),
          });
          if (!addressRes.ok) throw new Error('Failed to add primary address');
          const newAddress = await addressRes.json();
          updatedAddresses = [...get().addresses, newAddress];
        }
      }

      // Update state with potentially updated profile AND addresses
      set({ profile: updatedProfile, addresses: updatedAddresses, isLoading: false });

    } catch (error) {
      set({
        error: error instanceof Error ? error : new Error('An error occurred during profile update'),
        isLoading: false
      });
      throw error; // Re-throw error for the calling component to handle (e.g., show toast)
    }
  },

  addAddress: async (address) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch('/api/company/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(address),
      });

      if (!res.ok) {
        throw new Error('Failed to add address');
      }

      const newAddress = await res.json();
      set(state => ({ 
        addresses: [...state.addresses, newAddress],
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('An error occurred'), 
        isLoading: false 
      });
      throw error;
    }
  },

  updateAddress: async (id, data) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(`/api/company/addresses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Failed to update address');
      }

      const updatedAddress = await res.json();
      set(state => ({
        addresses: state.addresses.map(addr => 
          addr.id === id ? updatedAddress : addr
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('An error occurred'), 
        isLoading: false 
      });
      throw error;
    }
  },

  deleteAddress: async (id) => {
    try {
      set({ isLoading: true, error: null });

      const res = await fetch(`/api/company/addresses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete address');
      }

      set(state => ({
        addresses: state.addresses.filter(addr => addr.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('An error occurred'), 
        isLoading: false 
      });
      throw error;
    }
  },
})); 