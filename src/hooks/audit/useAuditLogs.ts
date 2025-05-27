import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserManagementConfiguration } from '@/core/config';
import type { AuditService } from '@/core/audit/interfaces';
import type { AuditLog, AuditLogFilters } from '@/core/audit/types';

export interface UseAuditLogsResult {
  logs: AuditLog[];
  total: number;
  isLoading: boolean;
  error: unknown;
  page: number;
  pageSize: number;
  filters: AuditLogFilters;
  setFilter: (key: keyof AuditLogFilters, value: unknown) => void;
  setPage: (page: number) => void;
  exportLogs: (format?: 'csv' | 'json' | 'xlsx' | 'pdf') => Promise<Blob>;
}

export function useAuditLogs(
  initialFilters: AuditLogFilters = {},
  initialPage = 1,
  initialPageSize = 20
): UseAuditLogsResult {
  const service = UserManagementConfiguration.getServiceProvider<AuditService>('auditService');
  if (!service) {
    throw new Error('AuditService is not registered in the service provider registry');
  }

  const [filters, setFilters] = useState<AuditLogFilters>(initialFilters);
  const [page, setPage] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);

  const { data, isLoading, error } = useQuery({
    queryKey: ['auditLogs', filters, page, pageSize],
    queryFn: () => service.getLogs(filters, page, pageSize),
    keepPreviousData: true
  });

  const setFilter = (key: keyof AuditLogFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const exportLogs = (format?: 'csv' | 'json' | 'xlsx' | 'pdf') =>
    service.exportLogs({ ...filters, format });

  return {
    logs: data?.logs ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    page,
    pageSize,
    filters,
    setFilter,
    setPage,
    exportLogs
  };
}
