import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Types for retention data
export interface RetentionMetrics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  pendingAnonymization: number;
  completedAnonymizations: number;
  retentionPeriodDays: number;
  lastJobRun: string;
}

export interface PendingAccount {
  userId: string;
  email: string;
  status: string;
  retentionType: string;
  lastLoginAt: string;
  anonymizeAt: string;
}

export interface PendingAnonymizationData {
  accounts: PendingAccount[];
  totalCount: number;
}

// API functions
export async function fetchRetentionMetrics(): Promise<RetentionMetrics> {
  const response = await fetch('/api/admin/retention/metrics');
  if (!response.ok) {
    throw new Error('Failed to fetch retention metrics');
  }
  return response.json();
}

export async function fetchPendingAnonymization(): Promise<PendingAnonymizationData> {
  const response = await fetch('/api/admin/retention/pending-anonymization');
  if (!response.ok) {
    throw new Error('Failed to fetch accounts pending anonymization');
  }
  return response.json();
}

export async function triggerAnonymization(): Promise<{ success: boolean; processed: number }> {
  const response = await fetch('/api/admin/retention/anonymize', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to trigger anonymization process');
  }
  return response.json();
}

export async function identifyInactiveAccounts(): Promise<{ success: boolean; identified: number }> {
  const response = await fetch('/api/admin/retention/identify-inactive', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to identify inactive accounts');
  }
  return response.json();
}

export interface RetentionDashboardProps {
  children: (props: {
    metrics: RetentionMetrics | undefined;
    pendingAccounts: PendingAnonymizationData | undefined;
    filteredAccounts: PendingAccount[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isProcessing: boolean;
    metricsLoading: boolean;
    metricsError: boolean;
    pendingLoading: boolean;
    pendingError: boolean;
    handleAnonymization: () => Promise<void>;
    handleIdentifyInactive: () => Promise<void>;
    formatDate: (date: string) => string;
    getStatusBadgeVariant: (status: string) => 'default' | 'secondary' | 'destructive' | 'outline';
  }) => ReactNode;
}

/**
 * Headless RetentionDashboard component that provides retention data and functionality through render props
 * This component handles the data fetching and state management without any UI rendering
 */
export function RetentionDashboard({ children }: RetentionDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Fetch retention metrics
  const {
    data: metrics,
    isLoading: metricsLoading,
    isError: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['retention-metrics'],
    queryFn: fetchRetentionMetrics,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
  
  // Fetch accounts pending anonymization
  const {
    data: pendingAccounts,
    isLoading: pendingLoading,
    isError: pendingError,
    refetch: refetchPending
  } = useQuery({
    queryKey: ['pending-anonymization'],
    queryFn: fetchPendingAnonymization,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
  
  // Filter pending accounts by search query
  const filteredAccounts = pendingAccounts?.accounts.filter(account => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      account.email?.toLowerCase().includes(query) ||
      account.userId?.toLowerCase().includes(query)
    );
  }) || [];
  
  // Handle running the anonymization process
  const handleAnonymization = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      await triggerAnonymization();
      await refetchPending();
      await refetchMetrics();
    } catch (error) {
      console.error('Error triggering anonymization:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle identifying inactive accounts
  const handleIdentifyInactive = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      await identifyInactiveAccounts();
      await refetchPending();
      await refetchMetrics();
    } catch (error) {
      console.error('Error identifying inactive accounts:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Format date
  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleString();
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Get badge variant based on status
  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'secondary';
      case 'pending':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return children({
    metrics,
    pendingAccounts,
    filteredAccounts,
    searchQuery,
    setSearchQuery,
    isProcessing,
    metricsLoading,
    metricsError,
    pendingLoading,
    pendingError,
    handleAnonymization,
    handleIdentifyInactive,
    formatDate,
    getStatusBadgeVariant
  });
}
