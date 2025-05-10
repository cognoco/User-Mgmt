import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import type { User as BaseUser } from '@/types/user';

// Extend User type for admin table compatibility
interface User extends BaseUser {
  role?: string;
  created_at?: string;
}

// Minimal role options for dropdown
const ROLE_OPTIONS = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Make Admin' },
];

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Fetch users from Supabase
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the builder pattern for test compatibility
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
  const handleRoleChange = async (user: User, newRole: string) => {
    setLoading(true);
    setError(null);
    try {
      // Update user role in Supabase
      const { error } = await supabase.from('users').update({ role: newRole }).eq('id', user.id);
      if (error) throw error;
      // Refetch users after update
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user role');
    } finally {
      setLoading(false);
    }
  };

  // Retry handler
  const handleRetry = () => setRetryCount((c) => c + 1);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Users</h1>
      <div className="mb-4 flex gap-2 items-center">
        <Input
          placeholder="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={loading}
        />
      </div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <Button size="sm" onClick={handleRetry} disabled={loading}>
              Retry
            </Button>
          </div>
        </Alert>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4}>Loading...</TableCell>
            </TableRow>
          ) : filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>No users found.</TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role || 'user'}</TableCell>
                <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : ''}</TableCell>
                <TableCell>
                  <select
                    value={user.role || 'user'}
                    onChange={(e) => handleRoleChange(user, e.target.value)}
                    disabled={loading}
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminUsers; 