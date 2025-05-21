import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Archive, Clock, RefreshCw, Trash2, UserX, Users } from 'lucide-react';

// Fetch retention metrics
async function fetchRetentionMetrics() {
  const response = await fetch('/api/admin/retention/metrics');
  if (!response.ok) {
    throw new Error('Failed to fetch retention metrics');
  }
  return response.json();
}

// Fetch accounts pending anonymization
async function fetchPendingAnonymization() {
  const response = await fetch('/api/admin/retention/pending-anonymization');
  if (!response.ok) {
    throw new Error('Failed to fetch accounts pending anonymization');
  }
  return response.json();
}

// Trigger the anonymization process
async function triggerAnonymization() {
  const response = await fetch('/api/admin/retention/anonymize', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to trigger anonymization process');
  }
  return response.json();
}

// Execute inactive account identification job
async function identifyInactiveAccounts() {
  const response = await fetch('/api/admin/retention/identify-inactive', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to identify inactive accounts');
  }
  return response.json();
}

export function RetentionDashboard() {
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
      return format(new Date(date), 'MMM d, yyyy HH:mm');
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Get badge variant based on status
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'warning':
        return 'warning';
      case 'inactive':
        return 'secondary';
      case 'grace_period':
        return 'outline';
      case 'anonymizing':
        return 'destructive';
      case 'anonymized':
        return 'secondary';
      default:
        return 'secondary';
    }
  };
  
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Data Retention Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <div className="text-2xl font-bold">{metrics?.activeUsers || 0}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warning Stage</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <div className="text-2xl font-bold">{metrics?.warningUsers || 0}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <div className="text-2xl font-bold">{metrics?.inactiveUsers || 0}</div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anonymized</CardTitle>
              <Archive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <div className="text-2xl font-bold">{metrics?.anonymizedUsers || 0}</div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
      
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Accounts Pending Anonymization</h2>
          <div className="flex gap-2">
            <Button 
              onClick={handleIdentifyInactive}
              disabled={isProcessing}
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Identify Inactive
            </Button>
            <Button 
              onClick={handleAnonymization}
              disabled={isProcessing || (pendingAccounts?.accounts.length || 0) === 0}
              variant="destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Process Anonymization
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <CardTitle>Users to be Anonymized</CardTitle>
                <CardDescription>
                  Accounts that have exceeded the retention period and are pending anonymization
                </CardDescription>
              </div>
              
              <div className="w-full md:w-auto">
                <Input
                  placeholder="Search by email or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {pendingLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-3 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : pendingError ? (
              <div className="p-4 text-destructive">
                Error loading accounts pending anonymization
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery
                  ? "No matching accounts found"
                  : "No accounts pending anonymization"}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Anonymize After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.userId}>
                      <TableCell className="font-medium">{account.email}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(account.status)}>
                          {account.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{account.retentionType}</TableCell>
                      <TableCell>{formatDate(account.lastLoginAt)}</TableCell>
                      <TableCell>{formatDate(account.anonymizeAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
} 