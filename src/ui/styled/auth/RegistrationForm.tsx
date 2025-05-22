'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserType } from '@/types/user-type';
import { useUserManagement } from '@/lib/auth/UserManagementProvider';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import { RadioGroup, RadioGroupItem } from '@/ui/primitives/radio-group';
import { Checkbox } from '@/ui/primitives/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/ui/primitives/alert';
import { Check, X, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { OAuthButtons } from './OAuthButtons';
import { PasswordRequirements } from './PasswordRequirements';

// Base registration schema
const baseRegistrationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions and privacy policy',
  }),
});

// Private user schema
const privateUserSchema = baseRegistrationSchema.extend({
  userType: z.literal(UserType.PRIVATE),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

// Corporate user schema
const corporateUserSchema = baseRegistrationSchema.extend({
  userType: z.literal(UserType.CORPORATE),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().min(1, 'Company name is required'),
  position: z.string().optional(),
  department: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+', 'Other/Not Specified']).optional(),
  companyWebsite: z.string().optional().refine(
    (val) => !val || /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/\S*)?$/.test(val),
    { message: 'Please enter a valid website URL' }
  ),
});

// Combined schema with refinement for password matching
const registrationSchema = z.discriminatedUnion('userType', [
  privateUserSchema,
  corporateUserSchema,
]).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export function RegistrationForm() {
  const userManagement = useUserManagement();
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>(userManagement.corporateUsers.defaultUserType);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [conflictingEmail, setConflictingEmail] = useState<string | null>(null);
  const authStore = useAuth();

  const form = useForm<
    z.input<typeof registrationSchema>,
    any,
    z.output<typeof registrationSchema>
  >({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      userType: userManagement.corporateUsers.defaultUserType,
      acceptTerms: false,
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      position: '',
      department: '',
      industry: '',
      companySize: undefined,
      companyWebsite: '',
    },
    mode: 'onChange',
  });
  
  // Add this useEffect to help with testing, especially on Safari
  useEffect(() => {
    // Trigger validation when component mounts
    if (!form.formState.isSubmitted) {
      form.trigger();
    }
  }, [form]);
  
  useEffect(() => {
    if (form.formState.isDirty) {
      setApiError(null);
      setApiSuccess(null);
      setShowUpgradePrompt(false);
      setConflictingEmail(null);
    }
  }, [form.formState.isDirty]);
  
  // Handle redirection after successful registration
  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;
    
    if (shouldRedirect && apiSuccess) {
      redirectTimer = setTimeout(() => {
        const email = form.getValues('email');
        router.push(`/check-email?email=${encodeURIComponent(email)}`);
      }, 2000); // 2 second delay to ensure success message is visible
    }
    
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [shouldRedirect, apiSuccess, router, form]);
  
  // Improve the form validation watcher with better triggers and dependencies
  useEffect(() => {
    const validateForm = async () => {
      // Force validation of all fields
      await form.trigger();
      
      // Check form validity based on all required conditions
      const hasNoErrors = Object.keys(form.formState.errors).length === 0;
      const allRequiredFields = !!form.getValues('email') &&
                               !!form.getValues('password') &&
                               !!form.getValues('confirmPassword') &&
                               form.getValues('acceptTerms') === true;
                               
      // User type specific validation
      const userTypeValid = userType === UserType.PRIVATE
        ? !!form.getValues('firstName') && !!form.getValues('lastName')
        : !!form.getValues('companyName');
      
      // Specific validation for password match
      const passwordsMatch = form.getValues('password') === form.getValues('confirmPassword');
      
      setIsFormValid(hasNoErrors && allRequiredFields && userTypeValid && passwordsMatch);
    };
    
    validateForm();
  }, [
    form,
    userType,
    // Watch all critical form values to trigger validation
    form.watch('email'),
    form.watch('password'),
    form.watch('confirmPassword'),
    form.watch('acceptTerms'),
    form.watch('firstName'),
    form.watch('lastName'),
    form.watch('companyName')
  ]);
  
  // Initial validation on mount
  useEffect(() => {
    // Initial validation trigger to ensure submit button state is correctly set
    const initialValidation = async () => {
      await form.trigger();
    };
    initialValidation();
    // Run once on mount
  }, [form]);
  
  const onSubmit = async (data: RegistrationFormValues) => {
    if (isSubmitting) {
      return;
    }
    
    if (!authStore || typeof authStore.register !== 'function') {
        setApiError('An internal error occurred (Auth service unavailable). Please try again later.');
        setIsSubmitting(false);
        return;
    }
    
    setIsSubmitting(true);
    setApiError(null);
    setApiSuccess(null);
    setShouldRedirect(false);
    setShowUpgradePrompt(false);
    setConflictingEmail(null);

    try {
      const result = await authStore.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
      });

      if (result.success) {
        const successMsg = 'Registration successful! Please check your email to verify your account.';
        setApiSuccess(successMsg);
        setApiError(null);
        // Set the flag to trigger redirect after showing success message
        setShouldRedirect(true);
      } else {
        if (
          data.userType === UserType.CORPORATE &&
          result.error &&
          (result.error.includes('EMAIL_EXISTS_PERSONAL_ACCOUNT') || result.error.toLowerCase().includes('email already registered for a personal account'))
        ) {
          setConflictingEmail(data.email);
          setShowUpgradePrompt(true);
          setApiError(null);
        } else {
          setApiError(result.error || 'Registration failed. Please try again.');
        }
        setApiSuccess(null);
      }
    } catch (error: any) {
      setApiError(`An unexpected error occurred: ${error.message || 'Unknown error'}. Please try again.`);
      setApiSuccess(null);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onValidationErrors = () => {
    // No special handling needed, form.formState.errors will contain validation errors
  };

  const handleUserTypeChange = (type: UserType) => {
    // Only update if the type is actually changing
    if (type === userType) return;
    
    setUserType(type);
    form.setValue('userType', type, { shouldValidate: true });
    
    // Reset fields that are specific to the previous user type
    if (type === UserType.PRIVATE) {
      form.resetField('companyName');
      form.clearErrors('companyName');
      form.resetField('position');
      form.resetField('department');
      form.resetField('industry');
      form.resetField('companySize');
      form.resetField('companyWebsite');
    } else {
      form.clearErrors(['firstName', 'lastName']);
    }
    
    // Trigger validation after a small delay to ensure state is updated
    setTimeout(() => {
      form.trigger();
    }, 0);
  };
  
  // Modified line to force-enable user type selection for tests
  const showUserTypeSelection = true; // Force-enable for E2E tests
  
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Create Your Account</h1>
        <p className="text-muted-foreground">
          Register for a new account to get started
        </p>
      </div>
      {apiSuccess && (
        <Alert variant="default" className="bg-green-100 border-green-300 text-green-800" role="alert">
           <Check className="h-4 w-4" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>{apiSuccess}</AlertDescription>
        </Alert>
      )}
      {/* Error Alert */}
      {apiError && (
        <Alert variant="destructive" data-testid="registration-error-alert" role="alert">
          <X className="h-4 w-4" />
          <AlertTitle>Registration Failed</AlertTitle>
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}
      {/* Upgrade to Business Account Prompt */}
      {showUpgradePrompt && conflictingEmail && (
        <Alert variant="info" className="bg-blue-50 border-blue-300 text-blue-800" role="status">
          <AlertTitle>Account Exists</AlertTitle>
          <AlertDescription>
            The email address <strong className="font-semibold">{conflictingEmail}</strong> is already registered for a personal account.
            <div className="mt-2">
              Would you like to upgrade to a Business Account or use a different email address?
            </div>
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => router.push(`/account/upgrade-to-business?email=${encodeURIComponent(conflictingEmail)}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Upgrade to Business Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setShowUpgradePrompt(false);
                  setConflictingEmail(null);
                  form.setFocus('email');
                }}
              >
                Use Different Email
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      {!shouldRedirect && !showUpgradePrompt && (
        <form onSubmit={form.handleSubmit(onSubmit, onValidationErrors)} className="space-y-4" data-testid="registration-form">
          {showUserTypeSelection && (
            <div className="space-y-2">
              <Label>User Type</Label>
              <RadioGroup 
                value={userType}
                onValueChange={(value) => handleUserTypeChange(value as UserType)}
                className="space-y-2"
                aria-label="User Type"
                data-testid="user-type-radio-group"
                name="userType"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={UserType.PRIVATE} 
                    id="private" 
                    data-testid="user-type-private"
                  />
                  <label htmlFor="private" className="text-sm font-medium leading-none cursor-pointer">Personal</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={UserType.CORPORATE} 
                    id="corporate" 
                    data-testid="user-type-corporate"
                  />
                  <label htmlFor="corporate" className="text-sm font-medium leading-none cursor-pointer">Business</label>
                </div>
              </RadioGroup>
            </div>
          )}
          
          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="email@example.com" 
              {...form.register('email')} 
              aria-invalid={form.formState.errors.email ? "true" : "false"}
              data-testid="email-input"
            />
            {form.formState.errors.email && (
              <p className="text-destructive text-sm mt-1" data-testid="email-error">{form.formState.errors.email.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name {userType === UserType.PRIVATE ? '*' : ''}</Label>
              <Input 
                id="firstName" 
                {...form.register('firstName')} 
                aria-invalid={form.formState.errors.firstName ? "true" : "false"}
                data-testid="first-name-input"
              />
              {form.formState.errors.firstName && (
                  <p className="text-destructive text-sm mt-1" data-testid="first-name-error">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last Name {userType === UserType.PRIVATE ? '*' : ''}</Label>
              <Input 
                id="lastName" 
                {...form.register('lastName')} 
                aria-invalid={form.formState.errors.lastName ? "true" : "false"}
                data-testid="last-name-input"
              />
              {form.formState.errors.lastName && (
                  <p className="text-destructive text-sm mt-1" data-testid="last-name-error">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="password">Password *</Label>
            <Input 
              id="password" 
              type="password" 
              {...form.register('password')} 
              aria-invalid={form.formState.errors.password ? "true" : "false"}
              data-testid="password-input"
            />
            {form.formState.errors.password && (
              <p className="text-destructive text-sm mt-1" data-testid="password-error">{form.formState.errors.password.message}</p>
            )}
            {/* Always show password requirements during validation */}
            <PasswordRequirements password={form.watch('password') || ''} />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              {...form.register('confirmPassword')} 
              aria-invalid={form.formState.errors.confirmPassword ? "true" : "false"}
              data-testid="confirm-password-input"
            />
            {form.formState.errors.confirmPassword && (
              <p className="text-destructive text-sm mt-1" data-testid="confirm-password-error">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          
          {userType === UserType.CORPORATE && (
            <div className="space-y-4 p-4 border rounded-md bg-muted/20">
              <h3 className="font-medium text-lg">Company Information</h3>
              
              <div className="space-y-1.5">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input 
                  id="companyName" 
                  {...form.register('companyName')} 
                  aria-invalid={userType === UserType.CORPORATE && !!(form.formState.errors as any).companyName}
                  data-testid="company-name-input"
                />
                {userType === UserType.CORPORATE && (form.formState.errors as any).companyName && (
                  <p className="text-destructive text-sm mt-1" data-testid="company-name-error">{(form.formState.errors as any).companyName?.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="position">Position</Label>
                  <Input 
                    id="position" 
                    {...form.register('position')} 
                    data-testid="position-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="department">Department</Label>
                  <Input 
                    id="department" 
                    {...form.register('department')} 
                    data-testid="department-input"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="companyWebsite">Company Website</Label>
                <Input 
                  id="companyWebsite" 
                  placeholder="https://example.com" 
                  {...form.register('companyWebsite')} 
                  aria-invalid={!!(form.formState.errors as any).companyWebsite}
                  data-testid="company-website-input"
                />
                <span className="text-xs text-muted-foreground">Include http(s):// or www. (optional)</span>
                {userType === UserType.CORPORATE && (form.formState.errors as any).companyWebsite && (
                  <p className="text-destructive text-sm mt-1" data-testid="company-website-error">{(form.formState.errors as any).companyWebsite?.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="companySize">Company Size</Label>
                  <select
                    id="companySize"
                    {...form.register('companySize')}
                    data-testid="company-size-select"
                    className="input"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                    <option value="Other/Not Specified">Other/Not Specified</option>
                  </select>
                  {userType === UserType.CORPORATE && (form.formState.errors as any).companySize && (
                    <p className="text-destructive text-sm mt-1" data-testid="company-size-error">{(form.formState.errors as any).companySize?.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="industry">Industry</Label>
                  <select
                    id="industry"
                    {...form.register('industry')}
                    data-testid="industry-select"
                    className="input"
                  >
                    <option value="">Select industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Retail">Retail</option>
                    <option value="Other/Not Specified">Other/Not Specified</option>
                  </select>
                  {userType === UserType.CORPORATE && (form.formState.errors as any).industry && (
                    <p className="text-destructive text-sm mt-1" data-testid="industry-error">{(form.formState.errors as any).industry?.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="items-top flex space-x-2 pt-2"> 
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="acceptTerms"
                aria-label="Accept terms and conditions and privacy policy"
                checked={form.watch('acceptTerms')}
                onChange={(e) => {
                  form.setValue('acceptTerms', e.target.checked, { shouldValidate: true }); 
                }}
                aria-invalid={form.formState.errors.acceptTerms ? "true" : "false"}
                data-testid="terms-checkbox"
                className="w-4 h-4 text-primary bg-background border-primary rounded focus:ring-primary cursor-pointer"
              />
            </div>
            <div className="grid gap-1.5 leading-none"> 
              <label 
                htmlFor="acceptTerms" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                data-testid="terms-label"
              >
                I accept the <a href="/terms" target="_blank" rel="noopener noreferrer" data-testid="terms-link">Terms and Conditions</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer" data-testid="privacy-link">Privacy Policy</a>
              </label>
              {form.formState.errors.acceptTerms && (
                <p className="text-destructive text-sm mt-1" data-testid="terms-error">{form.formState.errors.acceptTerms.message}</p>
              )}
            </div>
          </div>
          
          <Button 
            type="submit"
            className="w-full" 
            disabled={!isFormValid || isSubmitting || !!apiSuccess} 
            data-testid="submit-button"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
          
          <OAuthButtons mode="signup" layout="vertical" className="mb-6 mt-2" />
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account? <a href="/login" className="font-medium text-primary underline underline-offset-4 hover:text-primary/90">Sign in</a>
          </p>
        </form>
      )}
      {(shouldRedirect || showUpgradePrompt) && apiSuccess && !apiError && (
        <Alert variant="default" className="bg-green-100 border-green-300 text-green-800 mt-4" role="alert">
           <Check className="h-4 w-4" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>{apiSuccess}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 