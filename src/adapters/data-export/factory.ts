import type { IDataExportDataProvider } from '@/core/dataExport/IDataExportDataProvider';
import { SupabaseDataExportProvider } from '@/adapters/data-export/supabase/supabaseDataExport.provider';

export function createSupabaseDataExportProvider(options: {
  supabaseUrl: string;
  supabaseKey: string;
  [key: string]: any;
}): IDataExportDataProvider {
  return new SupabaseDataExportProvider(options.supabaseUrl, options.supabaseKey);
}

export function createDataExportProvider(config: {
  type: 'supabase' | string;
  options: Record<string, any>;
}): IDataExportDataProvider {
  switch (config.type) {
    case 'supabase':
      return createSupabaseDataExportProvider(config.options);
    default:
      throw new Error(`Unsupported data export provider type: ${config.type}`);
  }
}

export default createSupabaseDataExportProvider;
