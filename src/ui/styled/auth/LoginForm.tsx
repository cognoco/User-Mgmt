/**
 * Styled Login Form Component
 * 
 * This component provides a default styled implementation of the headless LoginForm.
 * It uses the headless component for behavior and adds UI rendering with Shadcn UI components.
 */

import React from 'react';
import { LoginForm as HeadlessLoginForm, LoginFormProps } from '../../headless/auth/LoginForm';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

export interface StyledLoginFormProps extends Omit<LoginFormProps, 'render'> {
  /**
   * Optional title for the login form
   */
  title?: string;
  
  /**
   * Optional description for the login form
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
}

export function LoginForm({
  title = 'Sign In',
  description = 'Enter your credentials to access your account',
  footer,
  className,
  ...headlessProps
}: StyledLoginFormProps) {
  return (
    <HeadlessLoginForm
      {...headlessProps}
      render={({
        handleSubmit,
        emailValue,
        setEmailValue,
        passwordValue,
        setPasswordValue,
        rememberMeValue,
        setRememberMeValue,
        isSubmitting,
        errors,
        touched,
        handleBlur
      }) => (
        <Card className={className}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={emailValue}
                  onChange={(e) => setEmailValue(e.target.value)}
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
                  placeholder="••••••••"
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  disabled={isSubmitting}
                  aria-invalid={touched.password && !!errors.password}
                  className={touched.password && errors.password ? 'border-red-500' : ''}
                />
                {touched.password && errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              
              {headlessProps.showRememberMe && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMeValue}
                    onCheckedChange={(checked) => 
                      setRememberMeValue(checked === true)
                    }
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal">
                    Remember me
                  </Label>
                </div>
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
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          
          {footer && <CardFooter>{footer}</CardFooter>}
        </Card>
      )}
    />
  );
}
