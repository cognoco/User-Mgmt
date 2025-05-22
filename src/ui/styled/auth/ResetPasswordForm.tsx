'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { ErrorBoundary, DefaultErrorFallback } from '@/ui/styled/common/ErrorBoundary';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/ui/primitives/form';
import { Alert, AlertDescription } from '@/ui/primitives/alert';
import { PasswordRequirements } from '@/ui/styled/auth/password-requirements';
import { api } from '@/lib/api/axios';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const form = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });
  
  const handleSubmit = async (data: ResetPasswordData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Call the API to update password with token
      await api.post('/api/auth/reset-password/confirm', {
        token,
        newPassword: data.password
      });
      
      setSuccess('Your password has been successfully reset. You can now log in with your new password.');
      form.reset();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ErrorBoundary fallback={DefaultErrorFallback}>
      <div className="w-full max-w-md mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reset your password</h2>
          <p className="text-muted-foreground mt-2">
            Enter a new password for your account.
          </p>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success ? (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter new password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                    
                    <PasswordRequirements password={field.value} />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirm your password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !form.formState.isValid}
              >
                {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </ErrorBoundary>
  );
} 