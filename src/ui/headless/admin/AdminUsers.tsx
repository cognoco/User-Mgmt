import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as BaseUser } from '@/types/user';

// Extend User type for admin table compatibility
export interface User extends BaseUser {
  role?: string;
  created_at?: string;
}

// Minimal role options for dropdown
export const ROLE_OPTIONS = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Make Admin' },
];

export interface AdminUsersProps {
  fetchUsers?: () => Promise<User[]>;
  handleRoleChange?: (user: User, newRole: string) => Promise<any>;
  children: (props: {
    users: User[];
    filteredUsers: User[];
    loading: boolean;
    error: string | null;
    search: string;
    setSearch: (search: string) => void;
    onRoleChange: (user: User, newRole: string) => Promise<void>;
    handleRetry: () => void;
  }) => React.ReactNode;
}

/**
 * Headless AdminUsers component that provides user management functionality through render props
 * This component handles the data fetching and state management without any UI rendering
 */
export function AdminUsers({ fetchUsers, handleRoleChange, children }: AdminUsersProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Default fetchUsers implementation (Supabase)
  const defaultFetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Default handleRoleChange implementation (Supabase)
  const defaultHandleRoleChange = async (user: User, newRole: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('users').update({ role: newRole }).eq('id', user.id);
      if (error) throw error;
      // Refetch users after update
      await (fetchUsers || defaultFetchUsers)();
    } catch (err: any) {
      setError(err.message || 'Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users on mount and on retry
  useEffect(() => {
    setLoading(true);
    setError(null);
    if (fetchUsers) {
      fetchUsers()
        .then((users) => setUsers(users))
        .catch((err) => {
          setError(err.message || 'Failed to fetch users');
          setUsers([]);
        })
        .finally(() => setLoading(false));
    } else {
      defaultFetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  // Filter users by search
  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const s = search.toLowerCase();
    return users.filter(
      (u) =>
        u.email?.toLowerCase().includes(s) ||
        u.fullName?.toLowerCase().includes(s) ||
        u.username?.toLowerCase().includes(s)
    );
  }, [users, search]);

  // Handle role update
  const onRoleChange = async (user: User, newRole: string) => {
    await (handleRoleChange || defaultHandleRoleChange)(user, newRole);
  };

  // Retry handler
  const handleRetry = () => setRetryCount((c) => c + 1);

  return children({
    users,
    filteredUsers,
    loading,
    error,
    search,
    setSearch,
    onRoleChange,
    handleRetry
  });
}

export default AdminUsers;
