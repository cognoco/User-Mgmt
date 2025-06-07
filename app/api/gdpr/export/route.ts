import { type NextRequest, NextResponse } from 'next/server';
import { createApiHandler, emptySchema } from '@/lib/api/routeHelpers';

export const GET = createApiHandler(
  emptySchema,
  async (request: NextRequest, authContext: any, data: any, services: any) => {
    try {
      const exportData = await services.gdpr.exportUserData(authContext.userId);
      if (!exportData) {
        return NextResponse.json({ error: 'Failed to generate data export.' }, { status: 500 });
      }

      const jsonData = JSON.stringify(exportData.data, null, 2);

      return new NextResponse(jsonData, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${exportData.filename}"`,
        },
      });
    } catch (error) {
      console.error(`Error during data export for user ${authContext.userId}:`, error);
      return NextResponse.json({ error: 'Failed to generate data export.' }, { status: 500 });
    }
  },
  {
    requireAuth: true,
  }
);
