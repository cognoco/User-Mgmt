import { type NextRequest, NextResponse } from 'next/server';
import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers'63;
import { createSuccessResponse } from '@/lib/api/common';
import { logUserAction } from '@/lib/audit/auditLogger';

export const POST = createApiHandler(
  emptySchema,
  async (request: NextRequest, authContext: any, data: any, services: any) => {
    console.log(`Account deletion requested for user: ${authContext.userId}`);
    
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // 2. Password Confirmation (Recommended for real implementation)
    // In a real app, you'd likely require the user to re-enter their password here.

    try {
      const result = await services.gdpr.deleteAccount(authContext.userId);

      if (!result.success) {
        throw new Error(result.error || 'Deletion failed');
      }

      await logUserAction({
        userId: authContext.userId,
        action: 'ACCOUNT_DELETION_INITIATED',
        status: 'SUCCESS',
        ipAddress: ipAddress,
        userAgent: request.headers.get('user-agent'),
        targetResourceType: 'user',
        targetResourceId: authContext.userId
      });

      return createSuccessResponse({ message: result.message || 'Account deletion process initiated successfully.' });

    } catch (error) {
      console.error(`Error during mock account deletion for user ${authContext.userId}:`, error);
      await logUserAction({
        userId: authContext.userId,
        action: 'ACCOUNT_DELETION_ERROR',
        status: 'FAILURE',
        ipAddress: ipAddress,
        userAgent: request.headers.get('user-agent'),
        targetResourceType: 'user',
        targetResourceId: authContext.userId,
        details: { error: error instanceof Error ? error.message : String(error) }
      });
      return NextResponse.json({ error: 'Failed to process account deletion request.' }, { status: 500 });
    }
  },
  {
    requireAuth: true,
    includeUser: true,
  }
); 