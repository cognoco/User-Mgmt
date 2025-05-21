import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { TwoFactorMethod } from '@/types/2fa';
import { api } from '@/lib/api/axios';

// Form schema
const mfaFormSchema = z.object({
  code: z.string().min(6, 'Code must be at least 6 characters')
      .max(8, 'Code must not exceed 8 characters')
      .regex(/^[0-9A-Z-]+$/, 'Code must contain only digits, uppercase letters, or hyphens'),
});

type MFAFormValues = z.infer<typeof mfaFormSchema>;

interface MFAVerificationFormProps {
  accessToken: string;
  onSuccess: (user: any, token: string) => void;
  onCancel?: () => void;
  enableResendCode?: boolean;
  enableRememberDevice?: boolean;
  mfaMethod?: 'sms' | 'email' | 'totp' | 'other'; // for controlling resend code visibility
}

export function MFAVerificationForm({
  accessToken,
  onSuccess,
  onCancel,
  enableResendCode = true,
  enableRememberDevice = true,
  mfaMethod = 'totp',
}: MFAVerificationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isUsingBackupCode, setIsUsingBackupCode] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [rememberDevice, setRememberDevice] = useState(false);

  const form = useForm<
    z.input<typeof mfaFormSchema>,
    any,
    z.output<typeof mfaFormSchema>
  >({
    resolver: zodResolver(mfaFormSchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (values: MFAFormValues) => {
    try {
      setIsLoading(true);
      setApiError(null);

      let response;
      if (isUsingBackupCode) {
        response = await api.post('/api/2fa/backup-codes/verify', {
          code: values.code,
        });
        onSuccess({}, '');
      } else {
        response = await api.post('/auth/mfa/verify', {
          code: values.code,
          method: TwoFactorMethod.TOTP,
          accessToken,
          ...(enableRememberDevice ? { rememberDevice } : {}),
        });
        onSuccess(response.data.user, response.data.token);
      }
    } catch (error: any) {
      setApiError(
        error.response?.data?.error ||
        'Failed to verify authentication code. Please try again.'
      );
      form.reset();
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBackupCode = () => {
    setIsUsingBackupCode(!isUsingBackupCode);
    form.reset();
  };

  // Resend code logic
  const handleResendCode = async () => {
    setResendMessage(null);
    setApiError(null);
    setResendTimer(30); // 30 seconds cooldown
    try {
      let endpoint = '';
      if (mfaMethod === 'sms') endpoint = '/auth/mfa/resend-sms';
      else if (mfaMethod === 'email') endpoint = '/auth/mfa/resend-email';
      else return;
      await api.post(endpoint, { accessToken });
      setResendMessage('[i18n:auth.mfa.resendSuccess]');
    } catch (error: any) {
      setApiError('[i18n:auth.mfa.resendError]');
    }
  };

  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          [i18n:auth.mfa.title]
        </h1>
        <p className="text-muted-foreground mt-2">
          {isUsingBackupCode
            ? '[i18n:auth.mfa.enterBackupCodePrompt]'
            : '[i18n:auth.mfa.enterCodePrompt]'}
        </p>
      </div>

      {apiError && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}
      {resendMessage && (
        <Alert variant="default" role="status">
          <AlertDescription>{resendMessage}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {isUsingBackupCode ? '[i18n:auth.mfa.backupCodeLabel]' : '[i18n:auth.mfa.codeLabel]'}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={isUsingBackupCode ? 'XXXX-XXXX' : '000000'}
                    autoComplete="one-time-code"
                    autoFocus
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Remember this device checkbox */}
          {enableRememberDevice && !isUsingBackupCode && (
            <div className="flex items-center gap-2">
              <input
                id="remember-device"
                type="checkbox"
                checked={rememberDevice}
                onChange={e => setRememberDevice(e.target.checked)}
                className="accent-primary"
              />
              <label htmlFor="remember-device" className="text-sm cursor-pointer">
                [i18n:auth.mfa.rememberDevice]
              </label>
              <span className="text-xs text-muted-foreground" title="[i18n:auth.mfa.rememberDeviceHelp]">?</span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              [i18n:auth.mfa.verifyButton]
            </Button>

            {/* Resend code button for SMS/email */}
            {enableResendCode && !isUsingBackupCode && (mfaMethod === 'sms' || mfaMethod === 'email') && (
              <Button
                type="button"
                variant="link"
                className="px-0"
                onClick={handleResendCode}
                disabled={resendTimer > 0}
                aria-disabled={resendTimer > 0}
              >
                {resendTimer > 0
                  ? `[i18n:auth.mfa.resendCode] (${resendTimer}s)`
                  : '[i18n:auth.mfa.resendCode]'}
              </Button>
            )}

            <Button
              type="button"
              variant="link"
              className="px-0"
              onClick={toggleBackupCode}
            >
              {isUsingBackupCode
                ? '[i18n:auth.mfa.useTOTPInstead]'
                : '[i18n:auth.mfa.useBackupCode]'}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                className="w-full"
              >
                [i18n:common.cancel]
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
} 