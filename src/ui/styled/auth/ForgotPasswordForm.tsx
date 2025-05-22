'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/auth/useAuth';
import { Input } from "@/ui/primitives/input";
import { Button } from "@/ui/primitives/button";
import { Label } from "@/ui/primitives/label";
import { Alert, AlertDescription, AlertTitle } from "@/ui/primitives/alert";

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  // Update to use individual selectors for React 19 compatibility
  const resetPassword = useAuth().resetPassword;
  const isLoading = useAuth().isLoading;
  const error = useAuth().error;
  const clearError = useAuth().clearError;
  const successMessage = useAuth().successMessage;
  const clearSuccessMessage = useAuth().clearSuccessMessage;
  
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    try {
      clearError();
      clearSuccessMessage();
      setSubmitted(false);
      
      await resetPassword(data.email);
      setSubmitted(true); 
    } catch (error) {
      if (process.env.NODE_ENV === 'development') { console.error("Unexpected error during password reset submission:", error) }
      setSubmitted(true);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {submitted && successMessage && !error && (
           <Alert variant="default" className="bg-green-100 border-green-300 text-green-800" role="alert">
              <AlertTitle>Request Sent</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        
        {submitted && error && (
           <Alert variant="destructive" role="alert">
              <AlertTitle>Request Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!successMessage && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                disabled={isLoading}
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && (
                <p className="text-destructive text-sm mt-1" role="alert">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </>
        )}
      </form>
      <div className="text-center text-sm mt-6">
        <a href="/login" className="font-medium text-primary hover:underline">
          Back to login
        </a>
      </div>
    </>
  );
} 