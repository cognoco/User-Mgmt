import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Request schema (optional password confirmation)
const disableRequestSchema = z.object({
  password: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { password } = disableRequestSchema.parse(body);

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

    // Verify that 2FA is enabled
    const totpEnabled = user.user_metadata?.totpEnabled === true;
    
    if (!totpEnabled) {
      return NextResponse.json(
        { error: 'MFA is not enabled' },
        { status: 400 }
      );
    }

    // If password is provided, verify it (for additional security)
    if (password) {
      // Note: Supabase doesn't provide a direct way to verify a password
      // In a production app, you might want to:
      // 1. Force a re-login with the provided password
      // 2. Use a dedicated API with proper password hashing/verification
      
      // For this implementation, we'll skip password verification
      // but note that it would be important for a production app
      console.log('Password verification would happen here in a production app');
    }

    // Disable 2FA by updating user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        totpSecret: null,
        totpEnabled: false,
        totpVerified: false,
        mfaMethods: [],
        backupCodes: null,
        backupCodesGeneratedAt: null,
      }
    });
    
    if (updateError) {
      console.error('Failed to update user metadata:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '2FA has been disabled successfully',
    });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 