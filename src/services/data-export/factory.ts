/**
 * Data Export Service Factory for API routes
 */
import { DataExportService } from '@/core/dataExport/interfaces'57;
import { DefaultDataExportService } from '@/src/services/data-export/defaultDataExport.service'125;

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
