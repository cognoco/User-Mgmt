import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import crypto from 'crypto';

const verifySchema = z.object({
  code: z.string().min(8).max(10), // e.g., XXXX-XXXX
});

function hashCode(code: string): string {
  // Use a secure hash for production (e.g., bcrypt or scrypt). For demo, use SHA256.
  return crypto.createHash('sha256').update(code).digest('hex');
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { code } = verifySchema.parse(body);

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
          set(name: string, value: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: Record<string, unknown>) {
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

    // Get backup codes from user metadata
    const storedCodes: string[] = user.user_metadata?.backupCodes || [];
    if (!storedCodes.length) {
      return NextResponse.json(
        { error: 'No backup codes found. Please generate new codes.' },
        { status: 400 }
      );
    }

    // For security, hash the input code and compare to stored hashes
    // (If stored codes are unhashed, compare directly, but recommend hashing in production)
    const codeHash = hashCode(code.replace(/-/g, '').toUpperCase());
    const storedHashes = storedCodes.map((c) => hashCode(c.replace(/-/g, '').toUpperCase()));
    const matchIdx = storedHashes.findIndex((h) => h === codeHash);

    if (matchIdx === -1) {
      return NextResponse.json(
        { error: 'Invalid backup code.' },
        { status: 400 }
      );
    }

    // Remove the used code
    const updatedCodes = [...storedCodes];
    updatedCodes.splice(matchIdx, 1);

    // Update user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        backupCodes: updatedCodes,
      },
    });
    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // Optionally: log the event (audit log)
    // TODO: Add audit logging here

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying backup code:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
