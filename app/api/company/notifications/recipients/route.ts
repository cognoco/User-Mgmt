import { NextRequest } from 'next/server';
import { getServiceSupabase } from '@/lib/database/supabase';
import { checkRateLimit } from '@/middleware/rate-limit';
import { withErrorHandling } from '@/middleware/error-handling';
import {
  createCreatedResponse,
  createForbiddenError,
  createUnauthorizedError,
  createValidationError,
  createServerError,
  ApiError,
  ERROR_CODES,
} from '@/lib/api/common';
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
    throw new (createServerError('Too many requests'));
  }

  try {
    // 2. Authentication & Get User
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createUnauthorizedError();
    }
    const token = authHeader.split(' ')[1];

    const supabaseService = getServiceSupabase();
    const { data: { user }, error: userError } = await supabaseService.auth.getUser(token);

    if (userError || !user) {
      throw createUnauthorizedError(userError?.message || 'Invalid token');
    }

    // 3. Parse and validate request body
    const body = await request.json();
    const validationResult = recipientSchema.safeParse(body);

    if (!validationResult.success) {
      throw createValidationError('Validation failed', validationResult.error.format());
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
      throw createForbiddenError('You do not have permission to add recipients for this company.');
    }
    
    // 5. Check if this is a duplicate email for the company's notifications
    const { data: existingRecipients } = await supabaseService
      .from('company_notification_recipients')
      .select('*, preference:company_notification_preferences!inner(company_id)')
      .eq('email', email)
      .eq('preference.company_id', company_id);
    
    if (existingRecipients && existingRecipients.length > 0) {
      throw createValidationError('This email address is already receiving notifications for this company.');
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
        throw createValidationError('The specified notification preference does not exist or belongs to a different company.');
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
          throw createServerError('Failed to create notification preferences.');
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
      throw createServerError('Failed to add recipient.');
    }
    
    // 8. Return success
    return createCreatedResponse({
      recipients: addedRecipients,
      message: 'Recipient added successfully',
    });

  } catch (error) {
    console.error('Unexpected error in POST /api/company/notifications/recipients:', error);
    throw createServerError('An internal server error occurred');
  }
}
export const POST = (req: NextRequest) => withErrorHandling(handlePost, req);
