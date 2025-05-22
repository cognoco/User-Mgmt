import { type NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/database/supabase';
import { getApiGdprService } from '@/lib/api/gdpr/factory';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];

  const supabaseService = getServiceSupabase();
  const { data: { user }, error: userError } = await supabaseService.auth.getUser(token);

  if (userError || !user) {
    return NextResponse.json({ error: userError?.message || 'Invalid token' }, { status: 401 });
  }

  const gdprService = getApiGdprService();

  try {
    const exportData = await gdprService.exportUserData(user.id);
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
    console.error(`Error during data export for user ${user.id}:`, error);
    return NextResponse.json({ error: 'Failed to generate data export.' }, { status: 500 });
  }
}
