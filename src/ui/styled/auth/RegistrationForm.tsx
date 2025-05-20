/**
 * Styled Registration Form Component
 * 
 * This component provides a default styled implementation of the headless RegistrationForm.
 * It uses the headless component for behavior and adds UI rendering with Shadcn UI components.
 */

import React from 'react';
import { RegistrationForm as HeadlessRegistrationForm, RegistrationFormProps } from '../../headless/auth/RegistrationForm';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

export interface StyledRegistrationFormProps extends Omit<RegistrationFormProps, 'render'> {
  /**
   * Optional title for the registration form
   */
  title?: string;
  
  /**
   * Optional description for the registration form
   */
  description?: string;
  
  /**
   * Optional footer content
   */
  footer?: React.ReactNode;
  
  /**
   * Optional className for styling
   */
  className?: string;
  
  /**
   * Optional terms and conditions link
   */
  termsLink?: string;
  
  /**
   * Optional privacy policy link
   */
  privacyLink?: string;
}

export function RegistrationForm({
  title = 'Create an Account',
  description = 'Enter your information to create a new account',
  footer,
  className,
  termsLink = '/terms',
  privacyLink = '/privacy',
  ...headlessProps
}: StyledRegistrationFormProps) {
  return (
    <HeadlessRegistrationForm
      {...headlessProps}
      render={({
        handleSubmit,
        formValues,
        setFormValue,
        isSubmitting,
        errors,
        touched,
        handleBlur,
        passwordStrength,
        passwordRequirements,
        termsAccepted,
        setTermsAccepted
      }) => (
        <Card className={className}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formValues.firstName}
                    onChange={(e) => setFormValue('firstName', e.target.value)}
                    onBlur={() => handleBlur('firstName')}
                    disabled={isSubmitting}
                    aria-invalid={touched.firstName && !!errors.firstName}
                    className={touched.firstName && errors.firstName ? 'border-red-500' : ''}
                  />
                  {touched.firstName && errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formValues.lastName}
                    onChange={(e) => setFormValue('lastName', e.target.value)}
                    onBlur={() => handleBlur('lastName')}
                    disabled={isSubmitting}
                    aria-invalid={touched.lastName && !!errors.lastName}
                    className={touched.lastName && errors.lastName ? 'border-red-500' : ''}
                  />
                  {touched.lastName && errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formValues.email}
                  onChange={(e) => setFormValue('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  disabled={isSubmitting}
                  aria-invalid={touched.email && !!errors.email}
                  className={touched.email && errors.email ? 'border-red-500' : ''}
                />
                {touched.email && errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formValues.password}
                  onChange={(e) => setFormValue('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  disabled={isSubmitting}
                  aria-invalid={touched.password && !!errors.password}
                  className={touched.password && errors.password ? 'border-red-500' : ''}
                />
                
                {/* Password strength indicator */}
                {formValues.password && (
                  <div className="mt-2">
                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          passwordStrength === 'strong' ? 'bg-green-500' : 
                          passwordStrength === 'medium' ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${
                          passwordStrength === 'strong' ? '100%' : 
                          passwordStrength === 'medium' ? '66%' : 
                          '33%'
                        }` }}
                      />
                    </div>
                    <p className="text-xs mt-1">
                      Password strength: {passwordStrength}
                    </p>
                    
                    {/* Password requirements */}
                    <ul className="text-xs mt-2 space-y-1">
                      {passwordRequirements.map((req) => (
                        <li key={req.text} className="flex items-center">
                          <span className={req.valid ? 'text-green-500' : 'text-gray-500'}>
                            {req.valid ? '✓' : '○'} {req.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {touched.password && errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formValues.confirmPassword}
                  onChange={(e) => setFormValue('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  disabled={isSubmitting}
                  aria-invalid={touched.confirmPassword && !!errors.confirmPassword}
                  className={touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : ''}
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
              
              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="terms" className="text-sm font-normal">
                  I agree to the{' '}
                  <a href={termsLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href={privacyLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                </Label>
              </div>
              {touched.termsAccepted && errors.termsAccepted && (
                <p className="text-sm text-red-500">{errors.termsAccepted}</p>
              )}
              
              {errors.form && (
                <Alert variant="destructive" className="mt-4">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertDescription>{errors.form}</AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting || !termsAccepted}
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </CardContent>
          
          {footer && <CardFooter>{footer}</CardFooter>}
        </Card>
      )}
    />
  );
}
