import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { authenticateApiKey } from '@/lib/api-keys/api-key-auth';
import { getServiceSupabase } from '@/adapters/database/supabase-provider';
import { checkRateLimit } from '@/middleware/rate-limit';

// GET handler to retrieve user profile data
export async function GET(request: NextRequest) {
  // Rate limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // Try session authentication first
    const sessionUser = await getCurrentUser();
    
    // If no session user, try API key authentication
    if (!sessionUser) {
      const apiKeyResult = await authenticateApiKey(request);
      
      if (!apiKeyResult.authenticated || !apiKeyResult.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Check if the API key has the required scope
      if (!apiKeyResult.scopes?.includes('read_profile')) {
        return NextResponse.json({ 
          error: 'Insufficient permissions', 
          details: 'This API key does not have the required read_profile scope' 
        }, { status: 403 });
      }
      
      // Use the user ID from the API key
      const userId = apiKeyResult.userId;
      const supabase = getServiceSupabase();
      
      // Fetch user profile data
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url, bio')
        .eq('id', userId)
        .single();
        
      if (userError || !userData) {
        console.error('Error fetching user profile:', userError);
        return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
      }
      
      return NextResponse.json(userData);
    }
    
    // If we have a session user, return their profile
    const supabase = getServiceSupabase();
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name, avatar_url, bio')
      .eq('id', sessionUser.id)
      .single();
      
    if (profileError || !profileData) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    
    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Unexpected error in protected endpoint:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 