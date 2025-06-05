/**
 * Data Export Service Factory for API routes
 */
import { DataExportService } from '@/core/data-export/interfaces';
import { DefaultDataExportService } from './default-data-export.service';

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
