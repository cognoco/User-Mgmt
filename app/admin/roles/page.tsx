'use client';

import { useEffect, useState } from 'react';
import { Metadata } from 'next';
import { RoleManagementPanel } from '@/components/admin/RoleManagementPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User } from '@/types/user';

export const metadata: Metadata = {
  title: 'Role Management',
  description: 'Manage user roles and permissions',
};

export default function RolesManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/admin/users');
        
        if (!response.ok) {
          throw new Error(`Error fetching users: ${response.statusText}`);
        }
        
        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  return (
    <div className="container py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
        <p className="text-muted-foreground">
          Assign roles and manage permissions for users
        </p>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : error ? (
        <Alert variant="destructive" className="my-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <RoleManagementPanel users={users} />
      )}
    </div>
  );
} 