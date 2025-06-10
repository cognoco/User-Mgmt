'use client';
import '@/lib/i18n';

import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Button } from '@/ui/primitives/button';
import { TwoFactorSetup } from '@/ui/styled/two-factor/TwoFactorSetup';
import { TwoFactorStatus } from '@/ui/styled/two-factor/TwoFactorStatus';
import { use2FAStore } from '@/lib/stores/2fa.store';

export default function TwoFactorPage() {
  const { t } = useTranslation();
  const { config, isLoading, error, disable2FA } = use2FAStore();
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    if (config.enabled) {
      setShowSetup(false);
    }
  }, [config.enabled]);

  const handleDisable = async () => {
    await disable2FA();
  };

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-center md:text-left">
        {t('security.twoFactorAuth.title', 'Two-Factor Authentication')}
      </h1>
      {config.enabled ? (
        <TwoFactorStatus
          isEnabled={config.enabled}
          lastUsed={undefined}
          loading={isLoading}
          error={error ? new Error(error) : null}
          onDisable={handleDisable}
        />
      ) : showSetup ? (
        <TwoFactorSetup />
      ) : (
        <div className="bg-card rounded-lg shadow p-6 space-y-4">
          <p className="text-sm">
            {t('security.twoFactorAuth.description', 'Add an extra layer of security to your account')}
          </p>
          <Button onClick={() => setShowSetup(true)}>{t('security.twoFactorAuth.enable', 'Enable 2FA')}</Button>
        </div>
      )}
    </div>
  );
}
