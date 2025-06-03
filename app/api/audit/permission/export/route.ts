import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAuditProvider } from '@/adapters/audit/factory';
import { middleware } from '@/middleware';

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  status: z.enum(['SUCCESS','FAILURE','INITIATED','COMPLETED']).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc','desc']).optional(),
  format: z.enum(['csv','json','xlsx','pdf']).default('json')
});

export const GET = middleware(['cors','csrf','rateLimit'], async (req: NextRequest) => {
  try {
    const user = (req as any).user;
    if(!user){
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const searchParams = Object.fromEntries(new URL(req.url).searchParams);
    const params = querySchema.parse(searchParams);
    const provider = createAuditProvider({
      type: 'supabase',
      options: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      }
    });
    const blob = await provider.exportLogs({
      ...params,
      page: 1,
      limit: 1000,
      resourceType: 'permission'
    });
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': blob.type,
        'Content-Disposition': `attachment; filename="audit-logs.${params.format}"`
      }
    });
  } catch (error) {
    console.error('Permission audit export error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
