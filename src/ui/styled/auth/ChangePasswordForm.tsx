'use client';

import { useState } from 'react';
import { FormEvent } from 'react';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import { Alert, AlertDescription, AlertTitle } from '@/ui/primitives/alert';
import { PasswordRequirements } from './PasswordRequirements';
import { ChangePasswordForm as HeadlessChangePasswordForm, type ChangePasswordFormValues } from '@/ui/headless/auth/change-password-form';

/**
 * Styled ChangePasswordForm component that uses the headless component for behavior
 * This follows the architecture guidelines by separating behavior and appearance
 */
export function ChangePasswordForm() {
  // Track if password is visible
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Custom onSubmit handler for API calls
  const handleCustomSubmit = async (data: ChangePasswordFormValues) => {
    // This could be implemented if we need custom API handling
    // For now, we'll use the default behavior from the headless component
    return;
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Change Password</h3>
      
      <HeadlessChangePasswordForm>
        {({
          handleSubmit,
          currentPasswordValue,
          setCurrentPasswordValue,
          newPasswordValue,
          setNewPasswordValue,
          confirmPasswordValue,
          setConfirmPasswordValue,
          isSubmitting,
          isValid,
          errors,
          touched,
          handleBlur,
          successMessage
        }) => (
          <>
            {/* Display Success Message */}
            {successMessage && (
              <Alert variant="default" className="bg-green-100 border-green-300 text-green-800">
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            
            {/* Display Error Message */}
            {errors.form && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errors.form}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={currentPasswordValue}
                  onChange={(e) => setCurrentPasswordValue(e.target.value)}
                  onBlur={() => handleBlur('currentPassword')}
                  disabled={isSubmitting}
                  aria-invalid={!!errors.currentPassword && touched.currentPassword}
                />
                {touched.currentPassword && errors.currentPassword && (
                  <p className="text-destructive text-sm mt-1">{errors.currentPassword}</p>
                )}
              </div>
              
              {/* New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  onBlur={() => handleBlur('newPassword')}
                  disabled={isSubmitting}
                  aria-invalid={!!errors.newPassword && touched.newPassword}
                />
                <PasswordRequirements password={newPasswordValue} />
                {touched.newPassword && errors.newPassword && (
                  <p className="text-destructive text-sm mt-1">{errors.newPassword}</p>
                )}
              </div>
              
              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPasswordValue}
                  onChange={(e) => setConfirmPasswordValue(e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  disabled={isSubmitting}
                  aria-invalid={!!errors.confirmPassword && touched.confirmPassword}
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full sm:w-auto"
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </>
        )}
      </HeadlessChangePasswordForm>
    </div>
  );
}