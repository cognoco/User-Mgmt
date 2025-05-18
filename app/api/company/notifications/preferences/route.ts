import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/database/supabase';
import { checkRateLimit } from '@/middleware/rate-limit';
import { z } from 'zod';

// Validation schema for creating a new notification preference
const preferenceSchema = z.object({
  company_id: z.string().uuid('Invalid company ID format'),
  notification_type: z.enum(['new_member_domain', 'domain_verified', 'domain_verification_failed', 'security_alert']),
  enabled: z.boolean().default(true),
  channel: z.enum(['email', 'in_app', 'both']).default('both'),
});

// GET /api/company/notifications/preferences - Get all notification preferences for the current user's company
export async function GET(request: NextRequest) {
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

    const supabaseService = getServiceSupabase();
    const { data: { user }, error: userError } = await supabaseService.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: userError?.message || 'Invalid token' }, { status: 401 });
    }

    // 3. Get Company Profile for the user
    const { data: companyProfile, error: profileError } = await supabaseService
      .from('company_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error(`Error fetching company profile for user ${user.id}:`, profileError);
      return NextResponse.json({ error: 'Failed to fetch company profile.' }, { status: 500 });
    }
    if (!companyProfile) {
      return NextResponse.json({ error: 'Company profile not found.' }, { status: 404 });
    }

    // 4. Get Notification Preferences for the company with recipients
    const { data: preferences, error: preferencesError } = await supabaseService
      .from('company_notification_preferences')
      .select(`
        *,
        recipients:company_notification_recipients(*)
      `)
      .eq('company_id', companyProfile.id);

    if (preferencesError) {
      console.error(`Error fetching notification preferences for company ${companyProfile.id}:`, preferencesError);
      return NextResponse.json({ error: 'Failed to fetch notification preferences.' }, { status: 500 });
    }

    // 5. Return preferences
    return NextResponse.json({ preferences });

  } catch (error) {
    console.error('Unexpected error in GET /api/company/notifications/preferences:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST /api/company/notifications/preferences - Create a new notification preference
export async function POST(request: NextRequest) {
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

    const supabaseService = getServiceSupabase();
    const { data: { user }, error: userError } = await supabaseService.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: userError?.message || 'Invalid token' }, { status: 401 });
    }

    // 3. Parse and validate request body
    const body = await request.json();
    const validationResult = preferenceSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationResult.error.format() 
      }, { status: 400 });
    }

    const { company_id, notification_type, enabled, channel } = validationResult.data;

    // 4. Verify the user has access to the company
    const { data: companyProfile, error: profileError } = await supabaseService
      .from('company_profiles')
      .select('id')
      .eq('id', company_id)
      .eq('user_id', user.id)
      .single();

    if (profileError || !companyProfile) {
      return NextResponse.json({ error: 'You do not have permission to update notification preferences for this company.' }, { status: 403 });
    }

    // 5. Check if preference already exists
    const { data: existingPreference, error: existingError } = await supabaseService
      .from('company_notification_preferences')
      .select('id')
      .eq('company_id', company_id)
      .eq('notification_type', notification_type)
      .maybeSingle();

    if (existingPreference) {
      // Update existing preference instead of creating a new one
      const { data: updatedPreference, error: updateError } = await supabaseService
        .from('company_notification_preferences')
        .update({
          enabled,
          channel,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingPreference.id)
        .select('*')
        .single();

      if (updateError) {
        console.error(`Error updating notification preference:`, updateError);
        return NextResponse.json({ error: 'Failed to update notification preference.' }, { status: 500 });
      }

      return NextResponse.json(updatedPreference);
    }

    // 6. Special handling for security_alert type
    let effectiveEnabled = enabled;
    let effectiveChannel = channel;

    if (notification_type === 'security_alert') {
      // Security alerts are always enabled and sent via both channels
      effectiveEnabled = true;
      effectiveChannel = 'both';
    }

    // 7. Insert the new preference
    const { data: newPreference, error: insertError } = await supabaseService
      .from('company_notification_preferences')
      .insert({
        company_id,
        notification_type,
        enabled: effectiveEnabled,
        channel: effectiveChannel,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (insertError) {
      console.error(`Error inserting notification preference:`, insertError);
      return NextResponse.json({ error: 'Failed to create notification preference.' }, { status: 500 });
    }

    // 8. Also add the current admin user as a recipient by default
    await supabaseService
      .from('company_notification_recipients')
      .insert({
        preference_id: newPreference.id,
        user_id: user.id,
        is_admin: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    // 9. Return the new preference
    return NextResponse.json(newPreference);

  } catch (error) {
    console.error('Unexpected error in POST /api/company/notifications/preferences:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
} 