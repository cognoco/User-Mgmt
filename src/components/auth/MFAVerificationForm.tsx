import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
      .regex(/^[0-9A-Z\-]+$/, 'Code must contain only digits, uppercase letters, or hyphens'),
});

type MFAFormValues = z.infer<typeof mfaFormSchema>;

interface MFAVerificationFormProps {
  accessToken: string;
  onSuccess: (user: any, token: string) => void;
  onCancel?: () => void;
}

export function MFAVerificationForm({ accessToken, onSuccess, onCancel }: MFAVerificationFormProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isUsingBackupCode, setIsUsingBackupCode] = useState(false);

  const form = useForm<MFAFormValues>({
    resolver: zodResolver(mfaFormSchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = async (values: MFAFormValues) => {
    try {
      setIsLoading(true);
      setApiError(null);

      const response = await api.post('/auth/mfa/verify', {
        code: values.code,
        method: isUsingBackupCode ? 'backup' : TwoFactorMethod.TOTP,
        accessToken,
      });

      onSuccess(response.data.user, response.data.token);
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

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {t('auth.mfa.title')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isUsingBackupCode 
            ? t('auth.mfa.enterBackupCodePrompt') 
            : t('auth.mfa.enterCodePrompt')}
        </p>
      </div>

      {apiError && (
        <Alert variant="destructive">
          <AlertDescription>{apiError}</AlertDescription>
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
                  {isUsingBackupCode ? t('auth.mfa.backupCodeLabel') : t('auth.mfa.codeLabel')}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={isUsingBackupCode ? "XXXX-XXXX" : "000000"}
                    autoComplete="one-time-code"
                    autoFocus
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-3">
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading 
                ? t('common.loading')
                : t('auth.mfa.verifyButton')}
            </Button>

            <Button
              type="button"
              variant="link"
              className="px-0"
              onClick={toggleBackupCode}
            >
              {isUsingBackupCode 
                ? t('auth.mfa.useTOTPInstead')
                : t('auth.mfa.useBackupCode')}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                className="w-full"
              >
                {t('common.cancel')}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
} 