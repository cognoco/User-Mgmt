import { NextRequest, NextResponse } from 'next/server';
import { logUserAction } from '@/lib/audit/auditLogger';
import { getApiDataExportService } from '@/services/data-export';
import { ExportStatus } from '@/lib/exports/types';

/**
 * GET /api/profile/export/download?token={downloadToken}
 * Download a previously exported file using a secure token
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    const service = getApiDataExportService();
    
    if (!token) {
      return NextResponse.json({ error: 'Missing download token' }, { status: 400 });
    }
    
    // Get the export record using the token
    const exportRecord = await service.getUserDataExportByToken(token);
    
    if (!exportRecord) {
      return NextResponse.json({ 
        error: 'Invalid or expired download token' 
      }, { status: 404 });
    }
    
    if (exportRecord.status !== ExportStatus.COMPLETED) {
      return NextResponse.json({ 
        error: 'Export is not ready for download',
        status: exportRecord.status 
      }, { status: 400 });
    }
    
    if (!exportRecord.filePath) {
      return NextResponse.json({ error: 'Export file not found' }, { status: 404 });
    }
    
    const downloadUrl = service.getUserExportDownloadUrl(exportRecord.filePath);
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }
    const fileData = await response.arrayBuffer();
    
    // Determine content type based on format
    const contentType = exportRecord.format === 'csv' 
      ? 'text/csv'
      : 'application/json';
    
    // Extract filename from file path
    const filename = exportRecord.filePath.split('/').pop() || 
      `Personal_Data_Export_${exportRecord.userId}_${new Date().toISOString().slice(0,10)}.${exportRecord.format}`;
    
    // Log the download
    await logUserAction({
      userId: exportRecord.userId,
      action: 'USER_DATA_EXPORT_DOWNLOAD',
      status: 'SUCCESS',
      targetResourceType: 'user',
      targetResourceId: exportRecord.userId,
      details: { exportId: exportRecord.id, format: exportRecord.format }
    });
    
    // Return the file as a download
    return new NextResponse(fileData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error processing export download:', error);
    return NextResponse.json({ 
      error: 'Failed to download export',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 