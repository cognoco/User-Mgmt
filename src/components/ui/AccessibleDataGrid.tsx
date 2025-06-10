import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/ui/primitives/table';
import { Button } from '@/ui/primitives/button';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface AccessibleDataGridProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    column?: string;
    direction: 'asc' | 'desc';
    onSortChange: (column: string, direction: 'asc' | 'desc') => void;
  };
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function AccessibleDataGrid<T>({
  data,
  columns,
  keyField,
  pagination,
  sorting,
  onRowClick,
  isLoading = false,
}: AccessibleDataGridProps<T>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className="whitespace-nowrap">
                <div className="flex items-center gap-1">
                  <span>{column.header}</span>
                  {column.sortable && sorting && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-5 w-5 ${
                        sorting.column === column.key ? 'opacity-100' : 'opacity-50'
                      }`}
                      onClick={() =>
                        sorting.onSortChange(
                          column.key,
                          sorting.column === column.key && sorting.direction === 'asc'
                            ? 'desc'
                            : 'asc'
                        )
                      }
                      aria-label={`Sort by ${column.header} ${
                        sorting.column === column.key && sorting.direction === 'asc'
                          ? 'descending'
                          : 'ascending'
                      }`}
                      aria-pressed={sorting.column === column.key}
                    >
                      {sorting.column === column.key && sorting.direction === 'asc' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Loading rows
            Array(5)
              .fill(0)
              .map((_, rowIndex) => (
                <TableRow key={`loading-${rowIndex}`} className="animate-pulse">
                  {columns.map((column, colIndex) => (
                    <TableCell key={`loading-${rowIndex}-${colIndex}`}>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
          ) : data.length === 0 ? (
            // No data state
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results found.
              </TableCell>
            </TableRow>
          ) : (
            // Actual data
            data.map((item) => (
              <TableRow
                key={String(item[keyField])}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(item);
                        }
                      }
                    : undefined
                }
                role={onRowClick ? 'button' : undefined}
                className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : undefined}
              >
                {columns.map((column) => (
                  <TableCell key={`${String(item[keyField])}-${column.key}`}>
                    {column.cell(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center py-4 border-t">
          <div className="flex items-center gap-2" role="navigation" aria-label="Pagination">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm" aria-live="polite">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
