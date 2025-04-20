import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AuditLog {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  user_id: string;
  status_code: number;
  response_time: number;
  error?: string;
}

interface AuditLogFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  hasError?: boolean;
  page: number;
  limit: number;
  sortBy: 'timestamp' | 'status_code' | 'response_time';
  sortOrder: 'asc' | 'desc';
}

const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const STATUS_CODES = [200, 201, 400, 401, 403, 404, 500];

// Add proper type for Calendar date
type CalendarDate = Date | undefined;

export function AuditLogViewer() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 20,
    sortBy: 'timestamp',
    sortOrder: 'desc',
  });
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['auditLogs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/audit/logs?${params.toString()}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch audit logs');
      }
      return response.json();
    },
  });

  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setIsExporting(true);
      
      // Build query parameters from current filters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && !['page', 'limit'].includes(key)) {
          params.append(key, value.toString());
        }
      });
      params.append('format', format);

      // Fetch the export
      const response = await fetch(`/api/audit/logs/export?${params.toString()}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to export audit logs');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${format === 'csv' ? 'spreadsheet' : 'data'}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: `Audit logs have been exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export audit logs',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (error) {
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to fetch audit logs',
      variant: 'destructive',
    });
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Audit Logs</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              disabled={isExporting}
              aria-label="Export options"
            >
              Export <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              disabled={isExporting}
              onClick={() => !isExporting && handleExport('csv')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  !isExporting && handleExport('csv');
                }
              }}
              role="menuitem"
              tabIndex={0}
            >
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isExporting}
              onClick={() => !isExporting && handleExport('json')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  !isExporting && handleExport('json');
                }
              }}
              role="menuitem"
              tabIndex={0}
            >
              Export as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          role="search"
          aria-label="Audit log filters"
        >
          <div className="space-y-2">
            <label 
              id="date-range-label" 
              className="text-sm font-medium"
            >
              Date Range
            </label>
            <div 
              className="flex gap-2"
              role="group"
              aria-labelledby="date-range-label"
            >
              <Calendar
                mode="single"
                selected={filters.startDate ? new Date(filters.startDate) : undefined}
                onSelect={(date: CalendarDate) => handleFilterChange('startDate', date?.toISOString())}
                className="rounded-md border"
                aria-label="Start date"
              />
              <Calendar
                mode="single"
                selected={filters.endDate ? new Date(filters.endDate) : undefined}
                onSelect={(date: CalendarDate) => handleFilterChange('endDate', date?.toISOString())}
                className="rounded-md border"
                aria-label="End date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label 
              id="method-label" 
              className="text-sm font-medium"
            >
              Method
            </label>
            <Select
              value={filters.method || ''}
              onValueChange={(value) => handleFilterChange('method', value)}
            >
              <SelectTrigger aria-labelledby="method-label">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                {METHODS.map(method => (
                  <SelectItem key={method} value={method}>{method}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label 
              id="status-code-label" 
              className="text-sm font-medium"
            >
              Status Code
            </label>
            <Select
              value={filters.statusCode?.toString() || ''}
              onValueChange={(value) => handleFilterChange('statusCode', value ? parseInt(value) : undefined)}
            >
              <SelectTrigger aria-labelledby="status-code-label">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                {STATUS_CODES.map(code => (
                  <SelectItem key={code} value={code.toString()}>{code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label 
              id="path-label" 
              className="text-sm font-medium"
              htmlFor="path-input"
            >
              Path
            </label>
            <Input
              id="path-input"
              value={filters.path || ''}
              onChange={(e) => handleFilterChange('path', e.target.value)}
              placeholder="Filter by path..."
              aria-labelledby="path-label"
            />
          </div>

          <div className="space-y-2">
            <label 
              id="user-id-label" 
              className="text-sm font-medium"
              htmlFor="user-id-input"
            >
              User ID
            </label>
            <Input
              id="user-id-input"
              value={filters.userId || ''}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              placeholder="Filter by user ID..."
              aria-labelledby="user-id-label"
            />
          </div>

          <div className="space-y-2">
            <label 
              id="has-error-label" 
              className="text-sm font-medium"
            >
              Has Error
            </label>
            <Select
              value={filters.hasError?.toString() || ''}
              onValueChange={(value) => handleFilterChange('hasError', value === '' ? undefined : value === 'true')}
            >
              <SelectTrigger aria-labelledby="has-error-label">
                <SelectValue placeholder="Select error status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="true">Yes</SelectItem>
                <SelectItem value="false">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Table */}
        <div 
          className="rounded-md border"
          role="region"
          aria-label="Audit log results"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Timestamp</TableHead>
                <TableHead scope="col">Method</TableHead>
                <TableHead scope="col">Path</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col">Response Time</TableHead>
                <TableHead scope="col">Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell 
                    colSpan={6} 
                    className="text-center"
                    role="status"
                    aria-live="polite"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data?.logs.map((log: AuditLog) => (
                <TableRow 
                  key={log.id}
                  tabIndex={0}
                  role="row"
                  aria-label={`Log entry from ${format(new Date(log.timestamp), 'PPpp')}`}
                >
                  <TableCell>{format(new Date(log.timestamp), 'PPpp')}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={log.method === 'GET' ? 'secondary' : 'default'}
                      aria-label={`HTTP method: ${log.method}`}
                    >
                      {log.method}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{log.path}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={log.status_code >= 400 ? 'destructive' : 'default'}
                      aria-label={`Status code: ${log.status_code}, ${log.status_code >= 400 ? 'error' : 'success'}`}
                    >
                      {log.status_code}
                    </Badge>
                  </TableCell>
                  <TableCell aria-label={`Response time: ${log.response_time} milliseconds`}>
                    {log.response_time}ms
                  </TableCell>
                  <TableCell>
                    {log.error && (
                      <Badge 
                        variant="destructive"
                        aria-label={`Error: ${log.error}`}
                      >
                        {log.error}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data?.pagination && (
          <div 
            className="mt-4 flex items-center justify-between"
            role="navigation"
            aria-label="Pagination"
          >
            <div 
              className="text-sm text-muted-foreground"
              aria-live="polite"
            >
              Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
              {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)}{' '}
              of {data.pagination.total} results
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(data.pagination.page - 1)}
                    className={data.pagination.page === 1 ? 'pointer-events-none opacity-50' : ''}
                    aria-disabled={data.pagination.page === 1}
                    aria-label="Previous page"
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(data.pagination.page + 1)}
                    className={data.pagination.page === data.pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
                    aria-disabled={data.pagination.page === data.pagination.totalPages}
                    aria-label="Next page"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 