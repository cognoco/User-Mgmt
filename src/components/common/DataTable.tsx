import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ChevronDown, ChevronUp, Search, MoreHorizontal } from 'lucide-react';
import { useIsMobile, useIsTablet } from '@/lib/utils/responsive';
import { 
  DropdownMenu, 
  DropdownMenuContent,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  hideOnMobile?: boolean;
  primaryColumn?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  rowActions?: (record: T) => React.ReactNode;
  emptyMessage?: string;
  cardView?: boolean; // Force card view regardless of screen size
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  rowActions,
  emptyMessage = 'No data available',
  cardView: forceCardView = false,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  // Use card view on mobile and tablet, or if explicitly requested
  const useCardView = forceCardView || isMobile || isTablet;

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredData = sortedData.filter((item) => {
    if (!searchTerm) return true;
    return Object.values(item).some((value) => {
      if (value === null || value === undefined) return false;
      return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  const handleSort = (key: keyof T) => {
    setSortConfig((current) => ({
      key,
      direction:
        current?.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };
  
  // Get primary column or first column for card view
  const getPrimaryColumn = () => {
    const primaryCol = columns.find(col => col.primaryColumn);
    return primaryCol || columns[0];
  };

  // Filter visible columns for current view
  const getVisibleColumns = () => {
    if (useCardView) {
      return columns;
    }
    return columns.filter(col => !col.hideOnMobile || !isMobile);
  };

  // Search input component
  const SearchInput = () => (
    <div className="relative">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10"
      />
    </div>
  );

  // Render empty state
  if (filteredData.length === 0) {
    return (
      <div className="space-y-4">
        {searchable && <SearchInput />}
        <div className="text-center p-8 border border-dashed rounded-md">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Render card view
  const renderCardView = () => (
    <div className="grid grid-cols-1 gap-4">
      {filteredData.map((row, rowIndex) => {
        const primaryColumn = getPrimaryColumn();
        const primaryValue = primaryColumn.render 
          ? primaryColumn.render(row[primaryColumn.key], row)
          : row[primaryColumn.key]?.toString();
        
        return (
          <Card key={rowIndex} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Primary information in card header */}
              <div className="p-4 bg-muted/20 border-b flex justify-between items-center">
                <div className="font-medium">
                  {primaryValue}
                </div>
                {rowActions && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {rowActions(row)}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              {/* Other columns as key-value pairs */}
              <div className="p-4 space-y-2">
                {columns
                  .filter(col => col.key !== primaryColumn.key)
                  .map((column) => {
                    const cellValue = column.render 
                      ? column.render(row[column.key], row)
                      : row[column.key]?.toString() || '-';
                      
                    return (
                      <div key={column.key.toString()} className="grid grid-cols-2 gap-2">
                        <div className="text-sm font-medium text-muted-foreground">
                          {column.header}:
                        </div>
                        <div className="text-sm">
                          {cellValue}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  // Render table view
  const renderTableView = () => (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {getVisibleColumns().map((column) => (
              <TableHead key={column.key.toString()}>
                {column.sortable ? (
                  <Button
                    variant="ghost"
                    onClick={() => handleSort(column.key)}
                    className="flex items-center space-x-2 h-auto p-2 font-medium"
                  >
                    <span>{column.header}</span>
                    {sortConfig?.key === column.key && (
                      sortConfig.direction === 'asc' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )
                    )}
                  </Button>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
            {rowActions && <TableHead className="w-[80px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {getVisibleColumns().map((column) => {
                const cellValue = column.render 
                  ? column.render(row[column.key], row)
                  : row[column.key]?.toString() || '-';
                  
                return (
                  <TableCell key={column.key.toString()}>
                    {cellValue}
                  </TableCell>
                );
              })}
              {rowActions && (
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {rowActions(row)}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-4">
      {searchable && <SearchInput />}
      {useCardView ? renderCardView() : renderTableView()}
    </div>
  );
}