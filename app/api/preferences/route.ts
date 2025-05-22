import { type NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/adapters/database/supabase-provider';
import { userPreferencesSchema } from '@/types/database'; // Import the Zod schema

// Schema for the update payload (PATCH)
// Make all fields optional, except potentially complex nested ones if needed
const updatePreferencesSchema = userPreferencesSchema.partial().omit({ 
    id: true, 
    userId: true, 
    createdAt: true, 
    updatedAt: true 
}); 
// Example for nested notifications if needed:
// .extend({
//     notifications: userPreferencesSchema.shape.notifications.partial().optional()
// })


export async function GET(request: NextRequest) {
  // 1. Authentication
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

  // 2. Fetch Preferences
  try {
    const { data, error } = await supabaseService
      .from('user_preferences')
      .select('*')
      .eq('userId', user.id)
      .maybeSingle(); // Use maybeSingle in case preferences don't exist yet

    if (error) throw error;

    if (data) {
      return NextResponse.json(data);
    } else {
      // Optionally create default preferences if they don't exist
       console.log(`No preferences found for user ${user.id}, potentially creating defaults.`);
       // For now, return empty or default object, or 404
       // return NextResponse.json({}, { status: 200 }); 
       return NextResponse.json({ error: 'Preferences not found.' }, { status: 404 });
    }

  } catch (error: any) {
    console.error(`Error fetching preferences for user ${user.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch preferences.', details: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
   // 1. Authentication
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

   // 2. Parse and Validate Body
   let body;
   try {
     body = await request.json();
   } catch (e) {
     return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
   }
 
   const parseResult = updatePreferencesSchema.safeParse(body);
   if (!parseResult.success) {
     return NextResponse.json({ error: 'Validation failed', details: parseResult.error.format() }, { status: 400 });
   }
   const updateData = parseResult.data;

   // 3. Update Preferences (using upsert)
   try {
     // Use upsert to handle cases where preferences might not exist yet
     // Need to include userId for the upsert condition
     const payload = { ...updateData, userId: user.id, updatedAt: new Date().toISOString() };

     const { data, error } = await supabaseService
       .from('user_preferences')
       .upsert(payload, { onConflict: 'userId' })
       .select()
       .single(); // Return the updated/inserted record
 
     if (error) throw error;
 
     console.log(`Preferences updated for user ${user.id}`);
     return NextResponse.json(data);
 
   } catch (error: any) {
     console.error(`Error updating preferences for user ${user.id}:`, error);
     // Handle potential conflicts or other DB errors
     if (error.code === '23505') { // Example: unique constraint violation (shouldn't happen with upsert on userId)
        return NextResponse.json({ error: 'Conflict updating preferences.', details: error.message }, { status: 409 });
     }
     return NextResponse.json({ error: 'Failed to update preferences.', details: error.message }, { status: 500 });
   }
} 