import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Function to generate random backup codes
function generateBackupCodes(count = 10, length = 8): string[] {
  const codes: string[] = [];
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  for (let i = 0; i < count; i++) {
    let code = '';
    const randomBytes = crypto.randomBytes(length);
    
    for (let j = 0; j < length; j++) {
      // Use modulo to get an index within the chars string
      const index = randomBytes[j] % chars.length;
      code += chars[index];
    }
    
    // Format the code with a hyphen in the middle for readability
    const formattedCode = `${code.slice(0, 4)}-${code.slice(4)}`;
    codes.push(formattedCode);
  }
  
  return codes;
}

export async function POST(request: Request) {
  try {
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

    // Verify user has MFA enabled
    const totpEnabled = user.user_metadata?.totpEnabled === true;
    
    if (!totpEnabled) {
      return NextResponse.json(
        { error: 'MFA must be enabled to generate backup codes' },
        { status: 400 }
      );
    }

    // Generate new backup codes
    const backupCodes = generateBackupCodes();
    
    // Hash the backup codes for storage
    // In a real app, you'd want to hash these securely with a salt
    // but for simplicity we're just storing them directly here
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        backupCodes,
        backupCodesGeneratedAt: new Date().toISOString(),
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
      codes: backupCodes
    });
  } catch (error) {
    console.error('Error generating backup codes:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 