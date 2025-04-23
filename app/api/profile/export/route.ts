import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { middleware } from '@/middleware';

// Helper to fetch all relevant user data
async function getUserExportData(userId: string) {
  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('userId', userId)
    .single();

  // Fetch preferences
  const { data: preferences, error: prefsError } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Fetch activity log
  const { data: activityLogs, error: logError } = await supabase
    .from('user_actions_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Collect errors
  const errors = [profileError, prefsError, logError].filter(Boolean);
  if (errors.length > 0) {
    return { error: errors.map(e => e.message).join('; ') };
  }

  return {
    profile,
    preferences,
    activityLogs,
  };
}

export const GET = middleware(['cors', 'csrf', 'rateLimit'], async (req: NextRequest) => {
  const user = (req as any).user;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const exportData = await getUserExportData(user.id);
  if ('error' in exportData) {
    return NextResponse.json({ error: 'Failed to export data', details: exportData.error }, { status: 500 });
  }

  const filename = `Personal_Data_Export_${user.id}_${new Date().toISOString().slice(0,10)}.json`;
  const json = JSON.stringify(exportData, null, 2);

  return new NextResponse(json, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
});
