import { useState } from 'react';
import { useIsMobile, useIsTablet } from '@/lib/utils/responsive';

/**
 * Headless DataTable Component
 *
 * This component exposes the sorting and filtering behaviour of DataTable
 * without rendering any UI. Consumers provide a render prop to display
 * the table as needed.
 */

export interface Column<T> {
  key: keyof T;
  header: string;
  sortable?: boolean;
  hideOnMobile?: boolean;
  primaryColumn?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  cardView?: boolean;
  render: (props: {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    sortConfig: { key: keyof T; direction: 'asc' | 'desc' } | null;
    handleSort: (key: keyof T) => void;
    filteredData: T[];
    useCardView: boolean;
    getVisibleColumns: () => Column<T>[];
    getPrimaryColumn: () => Column<T>;
  }) => React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  cardView: forceCardView = false,
  render
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

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
    if (!searchable || !searchTerm) return true;
    return Object.values(item).some((value) => {
      if (value === null || value === undefined) return false;
      return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  const handleSort = (key: keyof T) => {
    setSortConfig((current) => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getPrimaryColumn = () => {
    const primaryCol = columns.find((c) => c.primaryColumn);
    return primaryCol || columns[0];
  };

  const getVisibleColumns = () => {
    if (useCardView) return columns;
    return columns.filter((c) => !c.hideOnMobile || !isMobile);
  };

  return (
    <>{render({
      searchTerm,
      setSearchTerm,
      sortConfig,
      handleSort,
      filteredData,
      useCardView,
      getVisibleColumns,
      getPrimaryColumn
    })}</>
  );
}

export default DataTable;
