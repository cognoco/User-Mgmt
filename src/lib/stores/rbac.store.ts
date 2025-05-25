import { create } from 'zustand';
import { api } from '@/lib/api/axios';
import { RBACState, Role, Permission, RoleSchema, UserRoleSchema } from '../../types/rbac';
import { useAuth } from '@/lib/hooks/useAuth';

export const useRBACStore = create<RBACState>()((set, get) => ({
  roles: [],
  userRoles: [],
  isLoading: false,
  error: null,

  fetchRoles: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/roles');
      set({ roles: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || error.response?.data?.message || (error instanceof Error ? error.message : 'Failed to fetch roles'),
        isLoading: false,
      });
    }
  },

  fetchUserRoles: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get(`/users/${userId}/roles`);
      set({ userRoles: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || error.response?.data?.message || (error instanceof Error ? error.message : 'Failed to fetch user roles'),
        isLoading: false,
      });
    }
  },

  assignRole: async (userId: string, roleId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post(`/users/${userId}/roles`, { roleId });
      
      // Update local state with stable object
      set((state) => ({
        userRoles: [...state.userRoles, response.data],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || error.response?.data?.message || (error instanceof Error ? error.message : 'Failed to assign role'),
        isLoading: false,
      });
    }
  },

  removeRole: async (userId: string, roleId: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.delete(`/users/${userId}/roles/${roleId}`);
      
      // Update local state with stable selector
      set((state) => ({
        userRoles: state.userRoles.filter(
          (userRole) => !(userRole.userId === userId && userRole.roleId === roleId)
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to remove role',
        isLoading: false,
      });
    }
  },

  hasPermission: (permission: Permission): boolean => {
    const state = get();
    const user = useAuth().user;
    
    if (!user) return false;

    // Get all roles for the current user
    const userRoleIds = state.userRoles
      .filter((ur) => ur.userId === user.id)
      .map((ur) => ur.roleId);

    // Get all permissions from user's roles
    const userPermissions = state.roles
      .filter((role) => userRoleIds.includes(role.id))
      .flatMap((role) => role.permissions);

    return userPermissions.includes(permission);
  },

  hasRole: (role: Role): boolean => {
    const state = get();
    const user = useAuth().user;
    
    if (!user) return false;

    // Get all roles for the current user
    const userRoleIds = state.userRoles
      .filter((ur) => ur.userId === user.id)
      .map((ur) => ur.roleId);

    // Check if user has the specified role
    return state.roles.some(
      (r) => userRoleIds.includes(r.id) && r.name === role
    );
  },

  clearError: () => {
    set({ error: null });
  },
})); 