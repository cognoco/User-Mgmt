import { type NextRequest, NextResponse } from 'next/server';
// import { z } from 'zod'; // Removed unused import
import { getApiAuthService, getSessionFromToken } from '@/services/auth/factory';
import { getApiUserService } from '@/services/user/factory';
import { checkRateLimit } from '@/middleware/rate-limit';
import { profileSchema } from '@/types/database'; // Corrected import path
import { logUserAction } from '@/lib/audit/auditLogger'; // Added audit logger import

// Derive schema specifically for privacy settings update
const PrivacySettingsUpdateSchema = profileSchema.shape.privacySettings;

// type PrivacySettingsUpdate = z.infer<typeof PrivacySettingsUpdateSchema>; // Removed unused type

// --- PATCH Handler for updating privacy settings --- 
export async function PATCH(request: NextRequest) {
  // Get IP and User Agent early
  const ipAddress = request.ip;
  const userAgent = request.headers.get('user-agent');
  let userIdForLogging: string | null = null;

  // 1. Rate Limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // 2. Authentication & Get User
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];

    const user = await getSessionFromToken(token);
    const userError = user ? null : new Error('Invalid token');

    if (userError || !user) {
      // Log unauthorized attempt
      await logUserAction({
          action: 'PRIVACY_SETTINGS_UPDATE_UNAUTHORIZED',
          status: 'FAILURE',
          ipAddress: ipAddress,
          userAgent: userAgent,
          targetResourceType: 'user_profile_privacy',
          details: { reason: userError?.message ?? 'Invalid token' }
      });
      return NextResponse.json({ error: userError?.message || 'Invalid token' }, { status: 401 });
    }
    userIdForLogging = user.id; // Store for logging

    // 3. Parse and Validate Body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const parseResult = PrivacySettingsUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: parseResult.error.format() }, { status: 400 });
    }
    
    const settingsToUpdate = parseResult.data;
    
    console.log(`Updating privacy settings for user ${user.id}:`, settingsToUpdate);

    // 4. Update Profile via service layer
    const userService = getApiUserService();
    const result = await userService.updateUserProfile(
      user.id,
      { privacySettings: settingsToUpdate } as any
    );
    const data = result.profile ? { privacySettings: result.profile.privacySettings } : null;
    const updateError = result.success ? null : new Error(result.error || 'update failed');

    // 5. Handle Errors
    if (updateError) {
      console.error(`Error updating privacy settings for user ${user.id}:`, updateError);
      
      // Log the failure
      await logUserAction({
          userId: userIdForLogging,
          action: 'PRIVACY_SETTINGS_UPDATE_FAILURE',
          status: 'FAILURE',
          ipAddress: ipAddress,
          userAgent: userAgent,
          targetResourceType: 'user_profile_privacy',
          targetResourceId: userIdForLogging,
          details: {
              reason: updateError.message
          }
      });

      return NextResponse.json({ error: 'Failed to update privacy settings.', details: updateError.message }, { status: 500 });
    }
    
    if (!data) {
        // This case might occur if the update didn't find a matching row
        return NextResponse.json({ error: 'Profile not found or update failed silently.' }, { status: 404 });
    }

    // 6. Handle Success
    // Log successful update
    await logUserAction({
        userId: userIdForLogging,
        action: 'PRIVACY_SETTINGS_UPDATE_SUCCESS',
        status: 'SUCCESS',
        ipAddress: ipAddress,
        userAgent: userAgent,
        targetResourceType: 'user_profile_privacy',
        targetResourceId: userIdForLogging,
        details: { updatedSettings: data.privacySettings } // Log the applied settings
    });
    
    return NextResponse.json(data.privacySettings); // Return the updated privacySettings object

  } catch (error) {
    console.error('Unexpected error in PATCH /api/profile/privacy:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    // Log the unexpected error
    await logUserAction({
        userId: userIdForLogging, // May be null if error happened before user fetch
        action: 'PRIVACY_SETTINGS_UPDATE_UNEXPECTED_ERROR',
        status: 'FAILURE',
        ipAddress: ipAddress,
        userAgent: userAgent,
        targetResourceType: 'user_profile_privacy',
        targetResourceId: userIdForLogging,
        details: { error: message }
    });

    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
} 