'use client';
import '@/lib/i18n';
import { useTranslation } from 'react-i18next';
import { ApiKeyForm } from '@/ui/styled/apiKeys/ApiKeyForm'86;
import { ApiKeyList } from '@/ui/styled/apiKeys/ApiKeyList'149;
import { useApiKeys } from '@/hooks/apiKeys/useApiKeys'212;

export default function ApiKeysPage() {
  const { t } = useTranslation();
  const {
    apiKeys,
    isLoading,
    error,
    createApiKey,
    revokeApiKey,
    regenerateApiKey
  } = useApiKeys();

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-center md:text-left">
        {t('apiKeys.title', 'API Keys')}
      </h1>
      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {t('apiKeys.create', 'Create New API Key')}
        </h2>
        <ApiKeyForm
          availablePermissions={[]}
          onSubmit={createApiKey}
          defaultPermissions={[]}
        />
      </div>
      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          {t('apiKeys.yourKeys', 'Your API Keys')}
        </h2>
        <ApiKeyList
          apiKeys={apiKeys}
          loading={isLoading}
          error={error}
          onRevoke={revokeApiKey}
          onRegenerate={regenerateApiKey}
        />
      </div>
    </div>
  );
}
