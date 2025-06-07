import type { ApiKey } from '@/core/apiKeys/types'0;

export interface ApiKeyListProps {
  apiKeys: ApiKey[];
  loading: boolean;
  error: string | null;
  onRevoke: (id: string) => Promise<void>;
  onRegenerate: (id: string) => Promise<{ key: string } & ApiKey>;
  renderItem?: (
    key: ApiKey,
    actions: { onRevoke: (id: string) => Promise<void>; onRegenerate: (id: string) => Promise<{ key: string } & ApiKey> }
  ) => React.ReactNode;
}

export function ApiKeyList({ apiKeys, loading, error, onRevoke, onRegenerate, renderItem }: ApiKeyListProps) {
  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return (
      <p className="text-destructive text-sm" role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {apiKeys.map((key) => (
        <div key={key.id}>{renderItem ? renderItem(key, { onRevoke, onRegenerate }) : null}</div>
      ))}
    </div>
  );
}
