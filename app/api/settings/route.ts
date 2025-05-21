import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/database/supabase';
import { checkRateLimit } from '@/middleware/rate-limit';

// Zod schema for updatable settings - should reflect userPreferencesSchema now
const SettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.enum(['en', 'es', 'fr']).optional(),
  // Assuming these map to the nested notifications object in userPreferencesSchema
  email_notifications: z.boolean().optional(), 
  push_notifications: z.boolean().optional(), 
  // Remove visibility as it's handled elsewhere
  // visibility: z.enum(['public', 'private']).optional(), 
}).partial(); 


// Fields to select/update in the profiles/user_preferences table
// Need to decide if this API updates profiles OR user_preferences, or both?
// For now, assume it primarily updates fields historically considered 'settings'
// which seem to align more with user_preferences table based on the updated schemas
const settingsFields = [
    'theme', 
    'language', 
    // Need clarification on how notifications map; assuming direct columns for now
    'email_notifications', 
    'push_notifications', 
    // Remove visibility
    // 'visibility'
] as const;

// --- GET Handler --- 
export async function GET(request: NextRequest) {
  // 1. Rate Limiting (Keep)
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // 2. Authentication & Get User (Keep)
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

    // 3. Fetch Settings (Should probably fetch from user_preferences table now)
    const { data: preferencesData, error: preferencesError } = await supabaseService
      .from('user_preferences') // Fetch from user_preferences
      .select(settingsFields.join(', ')) 
      .eq('userId', user.id) // Assuming userId column exists
      .single();

    // 4. Handle Errors (Adjust for preferences table)
    if (preferencesError) {
      console.error(`Error fetching preferences for user ${user.id}:`, preferencesError);
      // ... (handle specific errors like not found) ...
      return NextResponse.json({ error: 'Failed to fetch settings.', details: preferencesError.message }, { status: 500 });
    }
    
    if (!preferencesData) {
        return NextResponse.json({ error: 'User preferences not found.' }, { status: 404 });
    }

    // 5. Return Settings
    return NextResponse.json(preferencesData);

  } catch (error) {
    console.error('Unexpected error in GET /api/settings:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}

// --- PUT Handler --- 
export async function PUT(request: NextRequest) {
  // 1. Rate Limiting (Keep)
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // 2. Authentication & Get User (Keep)
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

    // 3. Parse and Validate Body (Use updated schema)
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const parseResult = SettingsSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Validation failed', details: parseResult.error.format() }, { status: 400 });
    }
    
    const settingsToUpdate = parseResult.data;
    
    if (Object.keys(settingsToUpdate).length === 0) {
        return NextResponse.json({ error: 'No valid settings provided for update.' }, { status: 400 });
    }

    console.log(`Updating preferences for user ${user.id}:`, settingsToUpdate);

    // 4. Update user_preferences Table
    const { data, error: updateError } = await supabaseService
      .from('user_preferences') // Update user_preferences table
      .update({ 
          ...settingsToUpdate, 
          updatedAt: new Date().toISOString() // Assuming updatedAt column exists
      })
      .eq('userId', user.id) // Assuming userId column exists
      .select(settingsFields.join(', ')) // Select updated values
      .single();

    // 5. Handle Errors (Adjust for preferences table)
    if (updateError) {
      console.error(`Supabase error updating preferences for user ${user.id}:`, updateError);
      // ... (handle specific errors)
      return NextResponse.json({ error: 'Failed to update settings.', details: updateError.message }, { status: 500 });
    }
    
    if (!data) {
        return NextResponse.json({ error: 'Preferences not found or update failed silently.' }, { status: 404 });
    }

    // 6. Handle Success
    return NextResponse.json({ 
        message: 'Settings updated successfully.',
        settings: data // Return the updated settings object
    });

  } catch (error) {
    console.error('Unexpected error in PUT /api/settings:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
} 