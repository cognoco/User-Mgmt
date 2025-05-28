import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/database/supabase';
import { checkRateLimit } from '@/middleware/rate-limit';
import { withErrorHandling } from '@/middleware/error-handling';
import { z } from 'zod';

// Validation schema for updating a notification preference
const updateSchema = z.object({
  enabled: z.boolean().optional(),
  channel: z.enum(['email', 'in_app', 'both']).optional(),
});

// PATCH /api/company/notifications/preferences/[id] - Update a notification preference
async function handlePatch(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Rate Limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // 2. Validate preference ID
    const preferenceId = params.id;
    if (!preferenceId) {
      return NextResponse.json({ error: 'Preference ID is required' }, { status: 400 });
    }

    // 3. Authentication & Get User
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

    // 4. Parse and validate request body
    const body = await request.json();
    const validationResult = updateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationResult.error.format() 
      }, { status: 400 });
    }

    const updates = validationResult.data;

    // 5. Get the preference details with company info to check permissions
    const { data: preference, error: preferenceError } = await supabaseService
      .from('company_notification_preferences')
      .select(`
        *,
        company:company_profiles!inner(id, user_id)
      `)
      .eq('id', preferenceId)
      .single();

    if (preferenceError) {
      console.error(`Error fetching preference ${preferenceId}:`, preferenceError);
      return NextResponse.json({ error: 'Notification preference not found.' }, { status: 404 });
    }

    // 6. Verify user has permission (owns the company profile)
    if (preference.company.user_id !== user.id) {
      return NextResponse.json({ error: 'You do not have permission to update this notification preference.' }, { status: 403 });
    }

    // 7. Special handling for security_alert type
    if (preference.notification_type === 'security_alert') {
      // Security alerts are always enabled and sent via both channels
      if (!updates.enabled && updates.enabled === false) {
        return NextResponse.json({ error: 'Security alert notifications cannot be disabled.' }, { status: 400 });
      }
      if (updates.channel && updates.channel !== 'both') {
        return NextResponse.json({ error: 'Security alert notifications must use both email and in-app channels.' }, { status: 400 });
      }
    }

    // 8. Update the preference
    const { data: updatedPreference, error: updateError } = await supabaseService
      .from('company_notification_preferences')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', preferenceId)
      .select('*')
      .single();

    if (updateError) {
      console.error(`Error updating preference ${preferenceId}:`, updateError);
      return NextResponse.json({ error: 'Failed to update notification preference.' }, { status: 500 });
    }

    // 9. Return the updated preference
    return NextResponse.json(updatedPreference);

  } catch (error) {
    console.error(`Unexpected error in PATCH /api/company/notifications/preferences/${params.id}:`, error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
} 
export const PATCH = (req: NextRequest, ctx: { params: { id: string } }) => withErrorHandling((r) => handlePatch(r, ctx), req);
