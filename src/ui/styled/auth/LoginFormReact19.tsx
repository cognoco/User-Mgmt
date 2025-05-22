'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/auth/useAuth';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/ui/primitives/form';
import { Alert, AlertTitle, AlertDescription } from '@/ui/primitives/alert';
import { Checkbox } from '@/ui/primitives/checkbox';
import { OAuthButtons } from './OAuthButtons';
import { ErrorBoundary, DefaultErrorFallback } from '@/ui/styled/common/ErrorBoundary';
import Link from 'next/link';
import { FormWithRecovery } from '@/ui/primitives/form-with-recovery';
import { Spinner } from '@/ui/primitives/spinner';
import { Label } from '@/ui/primitives/label';

// Form schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' }),
  rememberMe: z.boolean().default(false),
});

type LoginData = z.infer<typeof loginSchema>;

/**
 * React 19 optimized login form component
 * Uses useTransition for improved UI responsiveness during login process
 */
export function LoginFormReact19() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  
  // Use selector pattern for better compatibility with React 19
  const login = useAuth().login;
  const sendVerificationEmail = useAuth().sendVerificationEmail;
  
  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const handleSubmit = (values: LoginData) => {
    setApiError(null);
    
    // Use React 19's useTransition for better performance during login
    startTransition(async () => {
      try {
        const result = await login(values.email, values.password, values.rememberMe);
        if (!result.success) {
          if (result.code === 'EMAIL_NOT_VERIFIED') {
            setApiError('Email not verified. Please check your inbox for the verification email.');
          } else {
            setApiError(result.error || 'Login failed. Please check your credentials and try again.');
          }
        }
      } catch (error) {
        console.error('Login error:', error);
        setApiError('An unexpected error occurred. Please try again later.');
      }
    });
  };

  const handleResendVerification = async () => {
    const email = form.getValues('email');
    if (!email) {
      setApiError('Please enter your email address first.');
      return;
    }
    
    try {
      const result = await sendVerificationEmail(email);
      if (result.success) {
        setApiError('Verification email sent. Please check your inbox.');
      } else {
        setApiError(result.error || 'Failed to send verification email. Please try again.');
      }
    } catch (err: any) {
      setApiError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <ErrorBoundary fallback={DefaultErrorFallback}>
      <div className="w-full max-w-md mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sign in to your account</h2>
          <p className="text-muted-foreground mt-2">
            Enter your email below to sign in
          </p>
        </div>
        
        <OAuthButtons mode="login" />
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        
        {apiError && (
          <Alert variant="destructive">
            <AlertTitle>Login Failed</AlertTitle>
            <AlertDescription>
              {apiError}
              {form.getValues('email') && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="text-primary hover:underline ml-2"
                >
                  Resend verification email
                </button>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <FormWithRecovery onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Form {...form}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="email@example.com" 
                        {...field} 
                        autoComplete="email"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="********" 
                        {...field} 
                        autoComplete="current-password"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="rememberMe" 
                {...form.register('rememberMe')}
              />
              <Label htmlFor="rememberMe" className="text-sm font-normal">
                Remember me for 30 days
              </Label>
            </div>
          </Form>

          <Button 
            type="submit" 
            className="w-full mt-6" 
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </FormWithRecovery>
        
        <div className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link 
            href="/auth/register" 
            className="text-primary hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>
    </ErrorBoundary>
  );
} 