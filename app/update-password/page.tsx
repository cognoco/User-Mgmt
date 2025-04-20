'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/database/supabase'; // Corrected import path
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PasswordRequirements } from '@/components/auth/PasswordRequirements';

// Zod schema for the update password form
const updatePasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null); // Track if token seems valid

  const form = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const password = form.watch('password') || '';

  // Check for Supabase session on mount (from recovery link fragment)
  useEffect(() => {
    const checkSession = async () => {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession(); // Renamed error variable
        if (sessionError) {
            console.error('Error getting session:', sessionError);
            setError('Failed to verify session. The link may be invalid or expired.');
            setIsTokenValid(false);
        } else if (session && session.user) {
            console.log('Password recovery session found for user:', session.user.email);
            setIsTokenValid(true);
        } else {
            setError('Invalid or expired password reset link.');
            setIsTokenValid(false);
        }
    };
    checkSession();
  }, []); // Run only on mount

  const onSubmit = async (data: UpdatePasswordFormValues) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (!isTokenValid) {
        setError('Cannot update password. The link may be invalid or expired.');
        setIsLoading(false);
        return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (updateError) {
        console.error('Supabase password update error:', updateError);
        if (updateError.message.includes('expired') || updateError.message.includes('Invalid Refresh Token')) {
            setError('Password reset link has expired. Please request a new one.');
        } else if (updateError.message.includes('same password')) {
            setError('New password must be different from the old password.');
        } else {
            setError(updateError.message || 'Failed to update password. Please try again.');
        }
      } else {
        setSuccess('Password updated successfully! Redirecting to login...');
        form.reset();
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (e: any) {
      console.error('Unexpected error during password update:', e);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-12"> {/* Use container */} 
      <div className="bg-card rounded-lg shadow p-6"> {/* Use card */} 
        <div className="text-center mb-6"> {/* Add margin bottom */} 
          <h1 className="text-3xl font-bold">Set New Password</h1>
        </div>

        {isTokenValid === null && (
            <p className="text-center text-muted-foreground">Verifying link...</p>
        )}

        {success && (
            <Alert variant="default" className="bg-green-100 border-green-300 text-green-800">
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
            </Alert>
        )}

        {error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                 {/* Offer to request new link on specific errors */} 
                 {(error.includes('expired') || error.includes('Invalid')) && ( 
                     <Button 
                         variant="link" 
                         onClick={() => router.push('/reset-password')} 
                         className="p-0 h-auto mt-2 text-destructive hover:text-destructive/80 font-medium underline underline-offset-4"
                     >
                         Request a new reset link
                     </Button>
                 )}
            </Alert>
        )}

        {isTokenValid === true && !success && !error && ( // Hide form on initial error too
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4"> {/* Added margin top */} 
              <div className="space-y-1.5">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register('password')}
                  disabled={isLoading}
                  aria-invalid={form.formState.errors.password ? 'true' : 'false'}
                />
                <PasswordRequirements password={password} /> 
                {form.formState.errors.password && (
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...form.register('confirmPassword')}
                  disabled={isLoading}
                  aria-invalid={form.formState.errors.confirmPassword ? 'true' : 'false'}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !form.formState.isValid}
              >
                {isLoading ? 'Updating Password...' : 'Update Password'}
              </Button>
            </form>
        )}

         {(isTokenValid === false || success || (isTokenValid === true && error)) && ( // Show login link on error too
             <div className="text-center text-sm mt-6">
                 <Button variant="link" onClick={() => router.push('/login')} className="p-0 h-auto font-medium text-primary hover:underline">
                     Return to Login
                 </Button>
             </div>
         )}
      </div>
    </div>
  );
} 