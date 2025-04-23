import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { middleware } from '@/middleware';

// Helper to fetch all relevant company data for export
async function getCompanyExportData(companyId: string) {
  // Fetch company profile
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single();

  // Fetch team members (excluding sensitive fields)
  const { data: members, error: membersError } = await supabase
    .from('team_members')
    .select('id, user_id, email, role, status, created_at')
    .eq('company_id', companyId);

  // Fetch roles (if applicable)
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('*')
    .eq('company_id', companyId);

  // Fetch company activity logs (optional, can be filtered)
  const { data: activityLogs, error: logError } = await supabase
    .from('company_activity_log')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  // Collect errors
  const errors = [companyError, membersError, rolesError, logError].filter(Boolean);
  if (errors.length > 0) {
    return { error: errors.map(e => e.message).join('; ') };
  }

  return {
    company,
    members,
    roles,
    activityLogs,
  };
}

export const GET = middleware(['cors', 'csrf', 'rateLimit'], async (req: NextRequest) => {
  const user = (req as any).user;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch user's company and check admin role
  const { data: companyMember, error: memberError } = await supabase
    .from('team_members')
    .select('company_id, role')
    .eq('user_id', user.id)
    .single();

  if (memberError || !companyMember) {
    return NextResponse.json({ error: 'Not a company member or error fetching membership.' }, { status: 403 });
  }
  if (companyMember.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
  }

  const exportData = await getCompanyExportData(companyMember.company_id);
  if ('error' in exportData) {
    return NextResponse.json({ error: 'Failed to export company data', details: exportData.error }, { status: 500 });
  }

  const filename = `Company_Data_Export_${companyMember.company_id}_${new Date().toISOString().slice(0,10)}.json`;
  const json = JSON.stringify(exportData, null, 2);

  return new NextResponse(json, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
});
