import type { AuditLogFilters } from '@/core/audit/types';

export interface AuditLogFilterProps {
  filters: AuditLogFilters;
  onChange: (key: keyof AuditLogFilters, value: unknown) => void;
}

export function AuditLogFilter({ filters, onChange }: AuditLogFilterProps) {
  return (
    <div className="flex gap-2 mb-2">
      <input
        aria-label="Search"
        value={filters.search ?? ''}
        onChange={e => onChange('search', e.target.value)}
        className="border p-1 rounded"
      />
    </div>
  );
}

