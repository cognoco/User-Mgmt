import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/database/supabase';
import { checkRateLimit } from '@/middleware/rate-limit';
import { withErrorHandling } from '@/middleware/error-handling';
import { z } from 'zod';

// Validation schema for adding a new recipient
const recipientSchema = z.object({
  company_id: z.string().uuid('Invalid company ID format'),
  preference_id: z.string().uuid('Invalid preference ID format').optional(),
  email: z.string().email('Invalid email address'),
  is_admin: z.boolean().default(false),
});

// POST /api/company/notifications/recipients - Add a new notification recipient
async function handlePost(request: NextRequest) {
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
    const validationResult = recipientSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationResult.error.format() 
      }, { status: 400 });
    }

    const { company_id, preference_id, email, is_admin } = validationResult.data;

    // 4. Verify the user has access to the company
    const { data: companyProfile, error: profileError } = await supabaseService
      .from('company_profiles')
      .select('id')
      .eq('id', company_id)
      .eq('user_id', user.id)
      .single();

    if (profileError || !companyProfile) {
      return NextResponse.json({ error: 'You do not have permission to add recipients for this company.' }, { status: 403 });
    }
    
    // 5. Check if this is a duplicate email for the company's notifications
    const { data: existingRecipients } = await supabaseService
      .from('company_notification_recipients')
      .select('*, preference:company_notification_preferences!inner(company_id)')
      .eq('email', email)
      .eq('preference.company_id', company_id);
    
    if (existingRecipients && existingRecipients.length > 0) {
      return NextResponse.json({ error: 'This email address is already receiving notifications for this company.' }, { status: 400 });
    }
    
    // 6. Get all notification preferences for the company if no specific preference_id is provided
    let preferencesToUpdate: {id: string}[] = [];
    
    if (preference_id) {
      const { data: specificPreference, error: prefError } = await supabaseService
        .from('company_notification_preferences')
        .select('id')
        .eq('id', preference_id)
        .eq('company_id', company_id)
        .single();
        
      if (prefError || !specificPreference) {
        return NextResponse.json({ error: 'The specified notification preference does not exist or belongs to a different company.' }, { status: 400 });
      }
      
      preferencesToUpdate = [specificPreference];
    } else {
      // Get all preferences for this company
      const { data: allPreferences, error: allPrefError } = await supabaseService
        .from('company_notification_preferences')
        .select('id')
        .eq('company_id', company_id);
        
      if (allPrefError || !allPreferences || allPreferences.length === 0) {
        // Create default preferences if none exist
        const notificationTypes = ['new_member_domain', 'domain_verified', 'domain_verification_failed', 'security_alert'];
        const defaultPreferences = notificationTypes.map(type => ({
          company_id,
          notification_type: type,
          enabled: type === 'security_alert', // Only security alerts enabled by default
          channel: 'both',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        const { data: createdPreferences, error: createError } = await supabaseService
          .from('company_notification_preferences')
          .insert(defaultPreferences)
          .select('id');
          
        if (createError || !createdPreferences) {
          console.error('Error creating default preferences:', createError);
          return NextResponse.json({ error: 'Failed to create notification preferences.' }, { status: 500 });
        }
        
        preferencesToUpdate = createdPreferences;
      } else {
        preferencesToUpdate = allPreferences;
      }
    }
    
    // 7. Add recipient to all relevant preferences
    const recipients = preferencesToUpdate.map(pref => ({
      preference_id: pref.id,
      email,
      is_admin,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    const { data: addedRecipients, error: addError } = await supabaseService
      .from('company_notification_recipients')
      .insert(recipients)
      .select();
      
    if (addError) {
      console.error('Error adding recipients:', addError);
      return NextResponse.json({ error: 'Failed to add recipient.' }, { status: 500 });
    }
    
    // 8. Return success
    return NextResponse.json({ 
      success: true, 
      message: 'Recipient added successfully',
      data: addedRecipients
    });

  } catch (error) {
    console.error('Unexpected error in POST /api/company/notifications/recipients:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
} 
export const POST = (req: NextRequest) => withErrorHandling(handlePost, req);
