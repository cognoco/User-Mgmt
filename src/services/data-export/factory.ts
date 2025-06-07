/**
 * Data Export Service Factory for API routes
 */
import { DataExportService } from '@/core/dataExport/interfaces';
import { DefaultDataExportService } from '@/services/data-export/defaultDataExport.service';

let instance: DataExportService | null = null;

export interface DataExportServiceOptions {
  reset?: boolean;
}

export function getApiDataExportService(options: DataExportServiceOptions = {}): DataExportService {
  if (options.reset) {
    instance = null;
  }

  if (!instance) {
    instance = new DefaultDataExportService();
  }

  return instance;
}
