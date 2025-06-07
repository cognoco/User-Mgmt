import { type NextRequest, NextResponse } from 'next/server';
import { getSessionFromToken } from '@/services/auth/factory';
import { getApiUserService } from '@/services/user/factory';
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

  const user = await getSessionFromToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // 2. Fetch Preferences
  try {
    const service = getApiUserService();
    const prefs = await service.getUserPreferences(user.id);
    return NextResponse.json(prefs);

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
 
    const user = await getSessionFromToken(token);
    if (!user) {
     return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
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

    // 3. Update Preferences
    try {
     const service = getApiUserService();
     const result = await service.updateUserPreferences(user.id, updateData);
     if (!result.success) {
       return NextResponse.json({ error: result.error || 'Failed to update preferences.' }, { status: 500 });
     }
     return NextResponse.json(result.preferences);

   } catch (error: any) {
     console.error(`Error updating preferences for user ${user.id}:`, error);
     return NextResponse.json({ error: 'Failed to update preferences.', details: error.message }, { status: 500 });
   }
} 