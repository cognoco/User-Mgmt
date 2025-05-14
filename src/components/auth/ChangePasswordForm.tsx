'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api/axios'; // Assuming axios instance path
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PasswordRequirements } from './PasswordRequirements'; // Import the helper

// Zod schema for changing password when logged in
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required.' }),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'New password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'New password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'New passwords do not match',
  path: ['confirmPassword'], 
}).refine(data => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from the current password.',
    path: ['newPassword'],
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<string | null>(null); // For highlighting specific field
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<
    z.input<typeof changePasswordSchema>,
    any,
    z.output<typeof changePasswordSchema>
  >({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const newPassword = form.watch('newPassword') || '';

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setError(null);
    setErrorField(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Call the backend API endpoint
      const response = await api.post('/api/auth/update-password', {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword, // Send confirmation for Zod on backend again if needed
      });
      
      setSuccess(response.data.message || 'Password updated successfully!');
      form.reset(); // Clear form on success

    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') { console.error('Change password error:', err); }
      const apiError = err.response?.data?.error || 'Failed to update password. Please try again.';
      const apiField = err.response?.data?.field || null; // Get specific field from API error
      setError(apiError);
      setErrorField(apiField);
      // Set focus on the specific field if provided by API
      if (apiField) {
         form.setFocus(apiField as keyof ChangePasswordFormValues);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
       <h3 className="text-lg font-medium">Change Password</h3>
      {/* Display Success Message */} 
      {success && (
         <Alert variant="default" className="bg-green-100 border-green-300 text-green-800">
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      {/* Display Error Message */} 
      {error && (
         <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
         {/* Current Password */} 
        <div className="space-y-1.5">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            type="password"
            {...form.register('currentPassword')}
            disabled={isLoading}
            aria-invalid={!!form.formState.errors.currentPassword || errorField === 'currentPassword'}
          />
          {form.formState.errors.currentPassword && (
            <p className="text-destructive text-sm mt-1">{form.formState.errors.currentPassword.message}</p>
          )}
        </div>

        {/* New Password */} 
        <div className="space-y-1.5">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            {...form.register('newPassword')}
            disabled={isLoading}
             aria-invalid={!!form.formState.errors.newPassword || errorField === 'newPassword'}
          />
          <PasswordRequirements password={newPassword} /> 
          {form.formState.errors.newPassword && (
            <p className="text-destructive text-sm mt-1">{form.formState.errors.newPassword.message}</p>
          )}
        </div>

        {/* Confirm New Password */} 
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...form.register('confirmPassword')}
            disabled={isLoading}
            aria-invalid={!!form.formState.errors.confirmPassword}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-destructive text-sm mt-1">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full sm:w-auto" // Adjust button width
          disabled={isLoading || !form.formState.isValid}
        >
          {isLoading ? 'Updating...' : 'Update Password'}
        </Button>
      </form>
    </div>
  );
} 