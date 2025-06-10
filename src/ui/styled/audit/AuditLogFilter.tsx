import { AuditLogFilter as HeadlessFilter } from '@/ui/headless/audit/AuditLogFilter';
import type { AuditLogFilters } from '@/core/audit/types';

export interface AuditLogFilterProps {
  filters: AuditLogFilters;
  onChange: (key: keyof AuditLogFilters, value: unknown) => void;
}

export function AuditLogFilter(props: AuditLogFilterProps) {
  return (
    <div className="p-2 border rounded">
      <HeadlessFilter {...props} />
    </div>
  );
}

