/**
 * Headless Activity Log Component
 *
 * Provides activity history data with pagination and filtering.
 * Connects to the user store for fetching audit logs.
 */

import { useEffect, useState } from 'react';
import { useUserStore } from '@/lib/stores/user.store';

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  action: string;
  description?: string;
  status?: string;
  [key: string]: any;
}

export interface ActivityLogFilters {
  startDate?: string;
  endDate?: string;
  action?: string;
  page?: number;
  limit?: number;
}

export interface ActivityLogRenderProps {
  logs: ActivityLogEntry[];
  isLoading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  setFilter: (field: keyof ActivityLogFilters, value: any) => void;
  refresh: () => Promise<void>;
}

export interface ActivityLogProps {
  /** Render prop receiving log state and handlers */
  children: (props: ActivityLogRenderProps) => React.ReactNode;
}

export function ActivityLog({ children }: ActivityLogProps) {
  const fetchUserAuditLogs = useUserStore((s) => s.fetchUserAuditLogs);
  const storeLoading = useUserStore((s) => s.isLoading);
  const storeError = useUserStore((s) => s.error);

  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<ActivityLogFilters>({ limit: 20 });

  const loadLogs = async () => {
    try {
      const data = await fetchUserAuditLogs({
        page,
        limit: filters.limit ?? 20,
        sortBy: 'timestamp',
        sortOrder: 'desc',
        startDate: filters.startDate,
        endDate: filters.endDate,
        userId: undefined,
      } as any);
      setLogs(Array.isArray(data.logs) ? data.logs : []);
      setTotalPages(data.pagination.totalPages);
    } catch {
      setLogs([]);
    }
  };

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters.startDate, filters.endDate, filters.action]);

  const setFilter = (field: keyof ActivityLogFilters, value: any) => {
    if (field === 'page') setPage(value as number);
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>{children({ logs, isLoading: storeLoading, error: storeError, page, totalPages, setFilter, refresh: loadLogs })}</>
  );
}

export default ActivityLog;
