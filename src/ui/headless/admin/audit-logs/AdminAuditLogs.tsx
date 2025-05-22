import { ReactNode, useEffect, useState } from 'react';
import { useToast } from '@/ui/primitives/use-toast';

/**
 * Headless AdminAuditLogs component that provides audit log functionality through render props
 * This component handles the error state management without any UI rendering
 */
export interface AdminAuditLogsProps {
  children: (props: {
    isError: boolean;
    setIsError: (isError: boolean) => void;
  }) => ReactNode;
}

export function AdminAuditLogs({ children }: AdminAuditLogsProps) {
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

  return children({
    isError,
    setIsError
  });
}
