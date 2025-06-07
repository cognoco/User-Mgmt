import type { ApiKey } from '@/core/apiKeys/types'0;
import { useApiKeys } from '@/hooks/apiKeys/useApiKeys'54;

export interface ApiKeyDetailRenderProps {
  apiKey: ApiKey;
  regenerate: () => Promise<{ key: string } & ApiKey>;
  revoke: () => Promise<void>;
}

export interface ApiKeyDetailProps {
  apiKey: ApiKey;
  children: (props: ApiKeyDetailRenderProps) => React.ReactNode;
}

export function ApiKeyDetail({ apiKey, children }: ApiKeyDetailProps) {
  const { regenerateApiKey, revokeApiKey } = useApiKeys();

  const regenerate = () => regenerateApiKey(apiKey.id);
  const revoke = () => revokeApiKey(apiKey.id);

  return <>{children({ apiKey, regenerate, revoke })}</>;
}
