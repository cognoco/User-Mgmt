'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { Dashboard } from '@/ui/styled/dashboard/Dashboard';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check authentication state after a short delay to let hydration complete
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // If not authenticated, redirect to login
      if (!isAuthenticated && !user) {
        router.push('/login');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  // Show loading state
  if (isLoading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg">Loading dashboard...</div>
      </main>
    );
  }

  // If authenticated, show dashboard content
  return (
    <main className="flex flex-col p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          {user ? `Welcome back, ${user.email}!` : 'Welcome to your dashboard!'}
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Stats cards */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">User Status</h3>
          <p className="mt-2 text-3xl font-semibold">Active</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Last Login</h3>
          <p className="mt-2 text-3xl font-semibold">Today</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">User ID</h3>
          <p className="mt-2 text-xl font-mono overflow-hidden text-ellipsis">{user?.id || 'Not available'}</p>
        </div>
      </div>
      
      {/* Dashboard component */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <Dashboard />
      </div>
    </main>
  );
} 