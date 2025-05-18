import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { middleware } from '@/middleware';
import { withExportRateLimit } from '@/middleware/export-rate-limit';
import {
  ExportFormat,
  ExportStatus
} from '@/lib/exports/types';
import {
  createUserDataExport,
  processUserDataExport,
  getUserExportData,
  checkUserExportStatus
} from '@/lib/exports/export.service';
import { logUserAction } from '@/lib/audit/auditLogger';

// Request schema for export options
const exportOptionsSchema = z.object({
  format: z.enum([ExportFormat.JSON, ExportFormat.CSV]).default(ExportFormat.JSON),
  // Add other export options as needed
});

/**
 * GET /api/profile/export/status?id={exportId}
 * Check the status of an export request
 */
export async function GET(req: NextRequest) {
  const user = (req as any).user;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const exportId = url.searchParams.get('id');

  // If no export ID, assume they want immediate download (legacy behavior)
  if (!exportId) {
    return handleImmediateExport(req);
  }

  // Check export status
  const statusResponse = await checkUserExportStatus(exportId);
  
  // Ensure the user can only access their own exports
  if (statusResponse.status !== ExportStatus.FAILED) {
    const userExport = await getUserDataExportById(exportId);
    if (!userExport || userExport.userId !== user.id) {
      return NextResponse.json({ error: 'Export not found' }, { status: 404 });
    }
  }

  return NextResponse.json(statusResponse);
}

/**
 * POST /api/profile/export
 * Initiate a new export request
 */
export const POST = middleware(['cors', 'csrf'], async (req: NextRequest) => {
  const user = (req as any).user;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return withExportRateLimit(
    req,
    async (request: NextRequest) => {
      try {
        // Parse and validate request body
        const body = await request.json().catch(() => ({}));
        const parseResult = exportOptionsSchema.safeParse(body);
        
        if (!parseResult.success) {
          return NextResponse.json({ 
            error: 'Invalid export options',
            details: parseResult.error.format()
          }, { status: 400 });
        }
        
        const requestedFormat = parseResult.data.format;
        
        // Log the export request
        await logUserAction({
          userId: user.id,
          action: 'USER_DATA_EXPORT_REQUEST',
          status: 'INITIATED',
          targetResourceType: 'user',
          targetResourceId: user.id,
          details: { format: requestedFormat }
        });
        
        // Create export record
        const exportRecord = await createUserDataExport(user.id);
        
        if (!exportRecord) {
          return NextResponse.json({ error: 'Failed to create export request' }, { status: 500 });
        }
        
        // For small datasets or when explicitly requested, process immediately
        // For large datasets, process asynchronously (background job will handle it)
        if (!exportRecord.isLargeDataset) {
          // Start processing in the background without awaiting
          processUserDataExport(exportRecord.id, user.id).catch(error => {
            console.error('Background export processing error:', error);
          });
        }
        
        // Return export ID and status
        return NextResponse.json({
          id: exportRecord.id,
          status: exportRecord.status,
          message: exportRecord.isLargeDataset 
            ? 'Export request received. You will be notified via email when the export is ready for download.'
            : 'Export is being processed. Check the status endpoint for updates.',
          isLargeDataset: exportRecord.isLargeDataset,
          format: exportRecord.format
        });
      } catch (error) {
        console.error('Error initiating export:', error);
        return NextResponse.json({ 
          error: 'Failed to initiate export',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    },
    { type: 'user', userId: user.id }
  );
});

/**
 * Legacy handler for immediate exports
 */
async function handleImmediateExport(req: NextRequest) {
  const user = (req as any).user;
  
  try {
    const exportData = await getUserExportData(user.id);
    if (!exportData) {
      return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
    }

    const filename = `Personal_Data_Export_${user.id}_${new Date().toISOString().slice(0,10)}.json`;
    const json = JSON.stringify(exportData, null, 2);

    // Log the export action
    await logUserAction({
      userId: user.id,
      action: 'USER_DATA_EXPORT',
      status: 'SUCCESS',
      targetResourceType: 'user',
      targetResourceId: user.id,
      details: { method: 'immediate', format: 'json' }
    });

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error processing immediate export:', error);
    
    // Log the failed export
    await logUserAction({
      userId: user.id,
      action: 'USER_DATA_EXPORT',
      status: 'FAILURE',
      targetResourceType: 'user',
      targetResourceId: user.id,
      details: { method: 'immediate', error: error instanceof Error ? error.message : 'Unknown error' }
    });
    
    return NextResponse.json({ 
      error: 'Failed to export data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Helper to get user export by ID
 */
async function getUserDataExportById(exportId: string) {
  const { data, error } = await supabase
    .from('user_data_exports')
    .select('*')
    .eq('id', exportId)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    userId: data.user_id,
    format: data.format,
    status: data.status,
    filePath: data.file_path,
    downloadToken: data.download_token,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    completedAt: data.completed_at,
    expiresAt: data.expires_at,
    errorMessage: data.error_message,
    fileSizeBytes: data.file_size_bytes,
    isLargeDataset: data.is_large_dataset,
    notificationSent: data.notification_sent
  };
}
