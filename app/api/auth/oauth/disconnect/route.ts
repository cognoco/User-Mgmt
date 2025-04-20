import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { OAuthProvider } from '@/types/oauth';

// Request schema
const disconnectRequestSchema = z.object({
  provider: z.nativeEnum(OAuthProvider),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { provider } = disconnectRequestSchema.parse(body);

    // Initialize Supabase client
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // TODO: In a complete implementation, we would:
    // 1. Query a user_oauth_connections table
    // 2. Remove the connection if found
    // 3. Potentially revoke associated tokens with the provider

    // For this implementation, we'll store the disconnection in user metadata
    // Get current metadata
    const connectedProviders = user.user_metadata?.connectedProviders || [];
    
    // Filter out the provider to disconnect
    const updatedProviders = connectedProviders.filter(
      (p: string) => p !== provider
    );

    // Update user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: { 
        connectedProviders: updatedProviders 
      }
    });

    if (updateError) {
      console.error('Failed to update connected providers:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in OAuth disconnect:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 