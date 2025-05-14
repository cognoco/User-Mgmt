'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserType } from '@/types/user-type';
import { useUserManagement } from '@/lib/auth/UserManagementProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth.store';
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
  industry: z.string().optional(),
  companySize: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
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
  const userManagementContext = useUserManagement?.();
  if (process.env.NODE_ENV === 'development') { console.log('[DEBUG] RegistrationForm mounted', { context: userManagementContext }); }
  const userManagement = useUserManagement();
  if (process.env.NODE_ENV === 'development') { console.log('[FORM_DEBUG] RegistrationForm rendered. corporateUsers:', userManagement.corporateUsers); }
  if (process.env.NODE_ENV === 'development') { console.log('RegistrationForm rendered'); }
  if (process.env.NODE_ENV === 'development') { console.log('[TEST_DEBUG] RegistrationForm function START'); }

  const router = useRouter();
  const [userType, setUserType] = useState<UserType>(userManagement.corporateUsers.defaultUserType);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);
  const authStore = useAuthStore();

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
      industry: '',
    },
    mode: 'onChange',
  });
  
  if (process.env.NODE_ENV === 'development') { console.log('[RegistrationForm State] isValid:', form.formState.isValid); }

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') { console.log('[RegistrationForm Errors]', form.formState.errors); }
  }, [form.formState.errors]);
  
  useEffect(() => {
    if (form.formState.isDirty) {
      setApiError(null);
      setApiSuccess(null);
    }
  }, [form.formState.isDirty]);
  
  // Debug logging for apiSuccess and apiError
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') { console.log('[RegistrationForm] apiSuccess changed:', apiSuccess); }
  }, [apiSuccess]);
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') { console.log('[RegistrationForm] apiError changed:', apiError); }
  }, [apiError]);
  
  const onSubmit = async (data: RegistrationFormValues) => {
    if (process.env.NODE_ENV === 'development') { console.log('[RegistrationForm onSubmit] Handler triggered!'); }
    if (process.env.NODE_ENV === 'development') { console.log('[RegistrationForm onSubmit] Form data:', data); }
    if (process.env.NODE_ENV === 'development') { console.log('[RegistrationForm onSubmit] authStore object:', authStore); }

    if (process.env.NODE_ENV === 'development') { console.log('[RegistrationForm] onSubmit triggered. Current isSubmitting:', isSubmitting); }
    if (isSubmitting) {
      if (process.env.NODE_ENV === 'development') { console.warn('[RegistrationForm] Submission already in progress, preventing duplicate submission.'); }
      return;
    }
    if (!authStore || typeof authStore.register !== 'function') {
        if (process.env.NODE_ENV === 'development') { console.error('[RegistrationForm] Auth store or register function is not available!', authStore); }
        setApiError('An internal error occurred (Auth service unavailable). Please try again later.');
        setIsSubmitting(false);
        return;
    }
    if (process.env.NODE_ENV === 'development') { console.log('[RegistrationForm] Setting isSubmitting to true...'); }
    setIsSubmitting(true);
    if (process.env.NODE_ENV === 'development') { console.log('[RegistrationForm] isSubmitting state should now be true.'); }

    setApiError(null);
    setApiSuccess(null);

    try {
      if (process.env.NODE_ENV === 'development') { console.log('[RegistrationForm onSubmit] Calling authStore.register...'); }
      const result = await authStore.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
      });
      if (process.env.NODE_ENV === 'development') { console.log('[RegistrationForm] authStore.register result:', result); }

      if (result.success) {
        const successMsg = 'Registration successful! Please check your email to verify your account.';
        setApiSuccess(successMsg);
        setApiError(null);
        if (process.env.NODE_ENV === 'development') { console.log('[RegistrationForm] Registration successful, showing success message.'); }
        // Show the success message for 2 seconds before resetting and redirecting
        setTimeout(() => {
          form.reset();
          if (process.env.NODE_ENV === 'development') { console.log(`[RegistrationForm] Redirecting to /check-email?email=${data.email}`); }
          router.push(`/check-email?email=${encodeURIComponent(data.email)}`);
        }, 2000);
      } else {
        if (process.env.NODE_ENV === 'development') { console.error('[RegistrationForm] Registration failed:', result.error); }
        setApiError(result.error || 'Registration failed. Please try again.');
        setApiSuccess(null);
        // Do not redirect or reset form if error
        return;
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') { console.error('[RegistrationForm] Unexpected error during registration:', error); }
      setApiError(`An unexpected error occurred: ${error.message || 'Unknown error'}. Please try again.`);
      setApiSuccess(null);
    } finally {
      if (process.env.NODE_ENV === 'development') { console.log('[RegistrationForm] Entering finally block, setting isSubmitting to false...'); }
      setIsSubmitting(false);
      if (process.env.NODE_ENV === 'development') { console.log('[RegistrationForm] isSubmitting state should now be false.'); }
      // Debug logging for form state after API call
      if (process.env.NODE_ENV === 'development') { console.log('[RegistrationForm] After API call:', {
        isValid: form.formState.isValid,
        isSubmitting,
        apiError
      }); }
    }
  };
  
  const onValidationErrors = (errors: any) => {
    // Log validation errors when submit fails client-side
    if (process.env.NODE_ENV === 'development') { console.error('[RegistrationForm Validation Errors on Submit]:', errors); }
    if (process.env.NODE_ENV === 'development') { console.log('[RegistrationForm State onValidationError] isValid:', form.formState.isValid); }
  };

  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
    form.setValue('userType', type);
    
    if (type === UserType.PRIVATE) {
      form.resetField('companyName');
      form.resetField('position');
      form.resetField('industry');
      form.resetField('companySize');
    } else {
      form.clearErrors(['firstName', 'lastName']);
    }
    form.trigger(); 
  };
  
  const showUserTypeSelection = userManagement.corporateUsers.enabled && userManagement.corporateUsers.registrationEnabled;
  
  if (process.env.NODE_ENV === 'development') { console.log('[RegistrationForm DEBUG] formState.isValid:', form.formState.isValid); }
  if (process.env.NODE_ENV === 'development') { console.log('[RegistrationForm DEBUG] formState.errors:', form.formState.errors); }
  if (process.env.NODE_ENV === 'development') { console.log('[RegistrationForm DEBUG] field values:', form.getValues()); }
  
  if (process.env.NODE_ENV === 'development') { console.log('[TEST_DEBUG] RegistrationForm function BEFORE RETURN'); }
  
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
      {(() => { if (process.env.NODE_ENV === 'development') { console.log('[DEBUG] Rendering error alert, apiError:', apiError); return null; } })()}
      {apiError && (
        <Alert variant="destructive" data-testid="registration-error-alert" role="alert">
          <X className="h-4 w-4" />
          <AlertTitle>Registration Failed</AlertTitle>
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}
      {!apiSuccess && (
        <form onSubmit={form.handleSubmit(onSubmit, onValidationErrors)} className="space-y-4" data-testid="registration-form">
          {showUserTypeSelection && (
            <div className="space-y-2">
              <Label>User Type</Label>
              <RadioGroup 
                defaultValue={userManagement.corporateUsers.defaultUserType} 
                value={userType}
                onValueChange={(value) => handleUserTypeChange(value as UserType)}
                className="flex space-x-4"
                aria-label="User Type"
                data-testid="user-type-radio-group"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={UserType.PRIVATE} id="private" data-testid="user-type-private" />
                  <Label htmlFor="private">Personal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={UserType.CORPORATE} id="corporate" data-testid="user-type-corporate" />
                  <Label htmlFor="corporate">Business</Label>
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
              <p className="text-destructive text-sm mt-1">{form.formState.errors.email.message}</p>
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
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.firstName.message}</p>
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
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.lastName.message}</p>
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
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.password.message}</p>
              )}
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
                <p className="text-destructive text-sm mt-1">{form.formState.errors.confirmPassword.message}</p>
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
                  <p className="text-destructive text-sm mt-1">{(form.formState.errors as any).companyName?.message}</p>
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
                  <Label htmlFor="industry">Industry</Label>
                  <Input 
                    id="industry" 
                    {...form.register('industry')} 
                    data-testid="industry-input"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="companySize">Company Size</Label>
                <select
                  id="companySize"
                  className="w-full px-3 py-2 border rounded-md bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...form.register('companySize')}
                  data-testid="company-size-select"
                >
                  <option value="">Select Company Size...</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>
            </div>
          )}
          
          <div className="items-top flex space-x-2 pt-2"> 
            <Checkbox 
              id="acceptTerms"
              aria-label="Accept terms and conditions and privacy policy"
              checked={form.watch('acceptTerms')}
              onCheckedChange={(checked) => {
                form.setValue('acceptTerms', checked === true, { shouldValidate: true }); 
              }}
              aria-invalid={form.formState.errors.acceptTerms ? "true" : "false"}
              data-testid="accept-terms-checkbox"
            />
            <div className="grid gap-1.5 leading-none"> 
              <label 
                htmlFor="acceptTerms" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the 
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-4 hover:text-primary/90">Terms and Conditions</a>
                 and 
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-4 hover:text-primary/90">Privacy Policy</a>.
              </label>
              {form.formState.errors.acceptTerms && (
                <p className="text-destructive text-sm mt-1">{form.formState.errors.acceptTerms.message}</p>
              )}
            </div>
          </div>
          
          <Button 
            type="submit"
            className="w-full" 
            disabled={isSubmitting || !form.formState.isValid || apiSuccess !== null} 
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
      {/* DEBUG: Render form state for E2E diagnosis */}
      <pre data-testid="form-debug" style={{ background: '#fee', color: '#900', fontSize: 12, padding: 8, marginBottom: 8 }}>
        {(() => {
          try {
            return JSON.stringify({
              isValid: form.formState.isValid,
              errors: form.formState.errors,
              values: form.getValues(),
            }, null, 2);
          } catch (err) {
            return 'DEBUG: Could not serialize form state';
          }
        })()}
      </pre>
    </div>
  );
} 