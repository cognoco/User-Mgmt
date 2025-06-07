"use client";

import { format } from 'date-fns';
import { Calendar } from '@/ui/primitives/calendar';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/primitives/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/primitives/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/ui/primitives/pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Badge } from '@/ui/primitives/badge';
import { ChevronDown, Copy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/primitives/dropdownMenu'761;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/ui/primitives/dialog';
import { ScrollArea } from '@/ui/primitives/scrollArea'1022;
import { HeadlessAuditLogViewer } from '@/ui/headless/audit/AuditLogViewer';

interface AuditLog {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  user_id: string;
  status_code: number;
  response_time: number;
  error?: string;
  action: string;
  status: string;
}


const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
const STATUS_CODES = [200, 201, 400, 401, 403, 404, 500];

type CalendarDate = Date | undefined;


const STATUS_BADGE: Record<string, { label: string; color: 'success' | 'destructive' | 'warning' | 'default' }> = {
  SUCCESS: { label: 'Success', color: 'success' },
  FAILURE: { label: 'Failure', color: 'destructive' },
  INITIATED: { label: 'Initiated', color: 'warning' },
  COMPLETED: { label: 'Completed', color: 'success' },
};

export function AuditLogViewer({ isAdmin = true }: { isAdmin?: boolean }) {
  if (!isAdmin) {
    return (
      <div className="w-full">
        <div className="text-red-600 font-semibold">Access denied: Admins only.</div>
      </div>
    );
  }

  return (
    <HeadlessAuditLogViewer isAdmin={isAdmin}>
      {({
        filters,
        isExporting,
        selectedLog,
        isModalOpen,
        data,
        isLoading,
        handleFilterChange,
        handlePageChange,
        handleExport,
        handleRowClick,
        handleCloseModal,
        handleCopyJson
      }) => (
        <>
          <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Audit Logs</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    disabled={isExporting}
                    aria-label="Export options"
                    role={isExporting ? "status" : undefined}
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
                  <DropdownMenuItem
                    disabled={isExporting}
                    onClick={() => !isExporting && handleExport('xlsx')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        !isExporting && handleExport('xlsx');
                      }
                    }}
                    role="menuitem"
                    tabIndex={0}
                  >
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={isExporting}
                    onClick={() => !isExporting && handleExport('pdf')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        !isExporting && handleExport('pdf');
                      }
                    }}
                    role="menuitem"
                    tabIndex={0}
                  >
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
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
                  <Select value={filters.method || ''} onValueChange={(value) => handleFilterChange('method', value)} aria-label="Method">
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

                <div className="space-y-2">
                  <label id="search-label" className="text-sm font-medium" htmlFor="search-input">
                    Search
                  </label>
                  <Input
                    id="search-input"
                    value={filters.search || ''}
                    onChange={e => handleFilterChange('search', e.target.value)}
                    placeholder="Search logs..."
                    aria-labelledby="search-label"
                  />
                </div>

                <div className="space-y-2">
                  <label id="resource-type-label" className="text-sm font-medium" htmlFor="resource-type-input">
                    Resource Type
                  </label>
                  <Input
                    id="resource-type-input"
                    value={filters.resourceType || ''}
                    onChange={e => handleFilterChange('resourceType', e.target.value)}
                    placeholder="e.g. user, company, team"
                    aria-labelledby="resource-type-label"
                  />
                </div>

                <div className="space-y-2">
                  <label id="resource-id-label" className="text-sm font-medium" htmlFor="resource-id-input">
                    Resource ID
                  </label>
                  <Input
                    id="resource-id-input"
                    value={filters.resourceId || ''}
                    onChange={e => handleFilterChange('resourceId', e.target.value)}
                    placeholder="Resource ID..."
                    aria-labelledby="resource-id-label"
                  />
                </div>

                <div className="space-y-2">
                  <label id="ip-address-label" className="text-sm font-medium" htmlFor="ip-address-input">
                    IP Address
                  </label>
                  <Input
                    id="ip-address-input"
                    value={filters.ipAddress || ''}
                    onChange={e => handleFilterChange('ipAddress', e.target.value)}
                    placeholder="IP Address..."
                    aria-labelledby="ip-address-label"
                  />
                </div>

                <div className="space-y-2">
                  <label id="user-agent-label" className="text-sm font-medium" htmlFor="user-agent-input">
                    User Agent
                  </label>
                  <Input
                    id="user-agent-input"
                    value={filters.userAgent || ''}
                    onChange={e => handleFilterChange('userAgent', e.target.value)}
                    placeholder="User Agent..."
                    aria-labelledby="user-agent-label"
                  />
                </div>
              </div>

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
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => handleRowClick(log)}
                      >
                        <TableCell>{format(new Date(log.timestamp), 'PPpp')}</TableCell>
                        <TableCell>
                          <span title={log.method}>
                            {log.method}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{log.path}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              STATUS_BADGE[log.status]?.color === 'destructive' ? 'destructive' :
                              STATUS_BADGE[log.status]?.color === 'default' ? 'default' :
                              (STATUS_BADGE[log.status]?.color === 'success' || STATUS_BADGE[log.status]?.color === 'warning') ? 'default' :
                              'default'
                            }
                            aria-label={`Status: ${STATUS_BADGE[log.status]?.label || log.status}`}
                            title={log.status}
                          >
                            {STATUS_BADGE[log.status]?.label || log.status}
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
                              title={log.error}
                            >
                              Error
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

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

          <Dialog open={isModalOpen} onOpenChange={open => { if (!open) handleCloseModal(); }}>
            <DialogContent className="max-w-lg w-full">
              <DialogHeader>
                <DialogTitle>Log Details</DialogTitle>
                <DialogDescription>
                  Full details for log entry
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                {selectedLog && (
                  <pre className="bg-muted rounded p-4 text-xs overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                )}
              </ScrollArea>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={handleCopyJson} aria-label="Copy JSON">
                  <Copy className="w-4 h-4 mr-2" /> Copy JSON
                </Button>
                <DialogClose asChild>
                  <Button variant="default" aria-label="Close details modal">Close</Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </HeadlessAuditLogViewer>
  );
}