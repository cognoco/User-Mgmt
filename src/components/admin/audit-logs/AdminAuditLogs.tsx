import { AuditLogViewer } from '@/components/audit/AuditLogViewer';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export function AdminAuditLogs() {
  const { toast } = useToast();
  const [isError, setIsError] = useState(false);
  
  useEffect(() => {
    // Check if we're simulating an error for testing
    if (typeof window !== 'undefined' && window.location.search.includes('simulateError=1')) {
      setIsError(true);
      toast({
        title: 'Error',
        description: 'Failed to fetch audit logs',
        variant: 'destructive',
      });
    }
  }, [toast]);

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
        <h2 className="text-lg font-semibold text-destructive mb-2">Error</h2>
        <p>Failed to fetch audit logs. Please try again later.</p>
      </div>
    );
  }

  return <AuditLogViewer isAdmin={true} />;
} 