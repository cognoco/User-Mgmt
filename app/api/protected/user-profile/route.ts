import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { authenticateApiKey } from '@/lib/apiKeys/apiKeyAuth';
import { getApiUserService } from '@/services/user/factory';
import { checkRateLimit } from '@/middleware/rateLimit';

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
      const service = getApiUserService();
      const userData = await service.getUserProfile(userId);

      if (!userData) {
        return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
      }

      return NextResponse.json({
        first_name: userData.firstName,
        last_name: userData.lastName,
        avatar_url: userData.avatarUrl,
        bio: userData.bio
      });
    }
    
    // If we have a session user, return their profile
    const service = getApiUserService();
    const profileData = await service.getUserProfile(sessionUser.id);

    if (!profileData) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      avatar_url: profileData.avatarUrl,
      bio: profileData.bio
    });
  } catch (error) {
    console.error('Unexpected error in protected endpoint:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 