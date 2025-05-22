import type { ApiKey } from '@/core/api-keys/types';
import { useApiKeys } from '@/hooks/api-keys/use-api-keys';

export interface ApiKeyListRenderProps {
  apiKeys: ApiKey[];
  isLoading: boolean;
  error: string | null;
  revoke: (id: string) => Promise<void>;
  regenerate: (id: string) => Promise<{ key: string } & ApiKey>;
  refresh: () => Promise<void>;
}

export interface ApiKeyListProps {
  children: (props: ApiKeyListRenderProps) => React.ReactNode;
}

export function ApiKeyList({ children }: ApiKeyListProps) {
  const { apiKeys, isLoading, error, revokeApiKey, regenerateApiKey, fetchApiKeys } = useApiKeys();

  return (
    <>{children({ apiKeys, isLoading, error, revoke: revokeApiKey, regenerate: regenerateApiKey, refresh: fetchApiKeys })}</>
  );
}
