import { type NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/database/supabase';
import { checkRateLimit } from '@/middleware/rate-limit';

export async function POST(request: NextRequest) {
  // 1. Rate Limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // 2. Extract Token (assuming client sends it)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization token' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    // 3. Call Supabase Admin SignOut (using Service Client)
    const supabaseService = getServiceSupabase();
    // Attempt to invalidate the session/token using admin API
    // Note: supabase.auth.signOut() is primarily client-side.
    // admin.signOut(token) might be the intended way for backend invalidation, 
    // but docs are unclear. Alternative: admin.updateUserById(userId, { revoke_refresh_tokens: true })
    // if you can get the user ID from the token first.
    // Let's try admin.signOut and see.
    const { error: signOutError } = await supabaseService.auth.admin.signOut(token);

    // 4. Handle Errors
    if (signOutError) {
      console.error('Supabase admin signout error:', signOutError);
      // Don't necessarily fail the logout on the client if the backend revoke fails
      // Log the error, but potentially still return success to the client?
      // Or return a specific error if needed.
      // Let's return 500 for now if backend signout fails.
      return NextResponse.json({ error: signOutError.message || 'Backend logout failed.' }, { status: 500 });
    }

    // 5. Handle Success
    console.log('Backend logout successful (token invalidation attempted).');
    return NextResponse.json({ message: 'Successfully logged out' }); // 200 OK

  } catch (error) {
    // 6. Handle Unexpected Errors
    console.error('Unexpected Logout API error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'An internal server error occurred.', details: message }, { status: 500 });
  }
} 