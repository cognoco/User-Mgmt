import { useEffect } from 'react';
import { useAuditLogViewer } from '@/ui/headless/audit/AuditLogViewer';

export interface UsePermissionAuditLogsOptions {
  userId?: string;
  resourceType?: string;
  resourceId?: string;
}

export function usePermissionAuditLogs(options: UsePermissionAuditLogsOptions = {}) {
  const viewer = useAuditLogViewer({ isAdmin: true });
  const { userId, resourceType, resourceId } = options;

  useEffect(() => {
    if (userId) viewer.handleFilterChange('userId', userId);
    if (resourceType) viewer.handleFilterChange('resourceType', resourceType);
    if (resourceId) viewer.handleFilterChange('resourceId', resourceId);
    viewer.handleFilterChange('search', 'PERMISSION');
  }, [userId, resourceType, resourceId]);

  return viewer;
}
