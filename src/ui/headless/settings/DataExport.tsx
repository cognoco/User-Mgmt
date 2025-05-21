/**
 * Headless Data Export Component
 *
 * Exposes export options state and export trigger without UI.
 */
import { useState } from 'react';
import { ExportFormat, ExportCategory, downloadDataExport } from '@/lib/utils/data-export';

export interface DataExportProps {
  onComplete?: () => void;
  render: (props: {
    selectedFormat: ExportFormat;
    setSelectedFormat: (f: ExportFormat) => void;
    selectedCategories: ExportCategory[];
    setSelectedCategories: (c: ExportCategory[]) => void;
    includeTimestamp: boolean;
    setIncludeTimestamp: (v: boolean) => void;
    anonymize: boolean;
    setAnonymize: (v: boolean) => void;
    prettify: boolean;
    setPrettify: (v: boolean) => void;
    isLoading: boolean;
    error: string | null;
    handleExport: () => Promise<void>;
  }) => React.ReactNode;
}

export function DataExport({ onComplete, render }: DataExportProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>(ExportFormat.JSON);
  const [selectedCategories, setSelectedCategories] = useState<ExportCategory[]>([ExportCategory.ALL]);
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [anonymize, setAnonymize] = useState(false);
  const [prettify, setPrettify] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await downloadDataExport({ selectedFormat, selectedCategories, includeTimestamp, anonymize, prettify });
      onComplete?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>{render({ selectedFormat, setSelectedFormat, selectedCategories, setSelectedCategories, includeTimestamp, setIncludeTimestamp, anonymize, setAnonymize, prettify, setPrettify, isLoading, error, handleExport })}</>
  );
}
