import { create } from 'zustand';
import { CompanyProfile, CompanyAddress } from '@/types/company';

export interface CompanyProfileState {
  profile: CompanyProfile | null;
  addresses: CompanyAddress[];
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<CompanyProfile>) => Promise<void>;
  addAddress: (address: CompanyAddress) => Promise<void>;
  updateAddress: (id: string, data: Partial<CompanyAddress>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
}

export const useCompanyProfileStore = create<CompanyProfileState>()(set => ({
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

  updateProfile: async (data: Partial<CompanyProfile>) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch('/api/company/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update company profile');
      }

      const updatedProfile = await response.json();

      set({ profile: updatedProfile, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('An error occurred'), 
        isLoading: false 
      });
    }
  },

  addAddress: async (address: CompanyAddress) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch('/api/company/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(address),
      });

      if (!response.ok) {
        throw new Error('Failed to add address');
      }

      const newAddress = await response.json();

      // Update addresses list with stable reference pattern for React 19
      set((state) => ({
        addresses: [...state.addresses, newAddress],
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('An error occurred'), 
        isLoading: false 
      });
    }
  },

  updateAddress: async (id: string, data: Partial<CompanyAddress>) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch(`/api/company/addresses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update address');
      }

      const updatedAddress = await response.json();

      // Update addresses list with stable reference pattern for React 19
      set((state) => ({
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
    }
  },

  deleteAddress: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch(`/api/company/addresses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete address');
      }

      // Update addresses list with stable reference pattern for React 19
      set((state) => ({
        addresses: state.addresses.filter(addr => addr.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error : new Error('An error occurred'), 
        isLoading: false 
      });
    }
  },
})) 