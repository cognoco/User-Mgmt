import { type NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/adapters/database/supabase-provider';
import { checkRateLimit } from '@/middleware/rate-limit';

export async function GET(request: NextRequest) {
  // 1. Rate Limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // 2. Authentication & Authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const supabaseService = getServiceSupabase();
    const { data: { user }, error: userError } = await supabaseService.auth.getUser(token);

    if (userError || !user) {
      console.error('Auth error getting user for admin access:', userError);
      return NextResponse.json({ error: userError?.message || 'Authentication required' }, { status: 401 });
    }

    // Check for admin role (using app_metadata.role as per docs/auth-roles.md)
    if (user.app_metadata?.role !== 'admin') {
       console.warn(`User ${user.id} attempted admin access without admin role.`);
       return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
    }

    // 3. Fetch Users (using Admin API)
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '50', 10);
    
    console.log(`Admin ${user.id} fetching users: page=${page}, perPage=${perPage}`);

    // Use admin.listUsers for pagination
    const { data: usersData, error: listError } = await supabaseService.auth.admin.listUsers({
      page: page,
      perPage: perPage,
      // Add sorting if needed, e.g., sortBy: { field: 'created_at', ascending: false }
    });

    // 4. Handle Errors
    if (listError) {
      console.error('Supabase admin listUsers error:', listError);
      return NextResponse.json({ error: 'Failed to fetch users.', details: listError.message }, { status: 500 });
    }

    // 5. Handle Success
    return NextResponse.json({ 
        users: usersData?.users || [], 
        // Optionally include pagination data from usersData if needed (total, etc.)
        // total: usersData?.total 
    });

  } catch (error) {
    // 6. Handle Unexpected Errors
    console.error('Unexpected error in /api/admin/users:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'An internal server error occurred.', details: message }, { status: 500 });
  }
} 