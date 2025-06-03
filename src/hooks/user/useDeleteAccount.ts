import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/notification/useToastAdvanced';

interface DeletionRequestPayload {
  mfaCode: string;
}

/**
 * Hook for handling account deletion functionality
 * @returns Functions and state for account deletion process
 */
export function useDeleteAccount() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  const deleteAccount = async (payload: DeletionRequestPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/gdpr/request-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Request failed');
      }

      toast({
        title: t('settings.account.deletionRequested'),
        description: t('settings.account.deletionRequestedDescription'),
      });

      router.push('/auth/login');
    } catch (err) {
      console.error('Failed to request account deletion:', err);
      setError(t('settings.account.deleteError'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteAccount,
    isLoading,
    error,
  };
} 