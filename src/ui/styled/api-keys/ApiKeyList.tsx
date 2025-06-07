import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';
import {
  ApiKeyList as HeadlessApiKeyList,
  ApiKeyListProps as HeadlessApiKeyListProps,
} from '@/ui/headless/apiKeys/ApiKeyList';

export function ApiKeyList(props: HeadlessApiKeyListProps) {
  return (
    <HeadlessApiKeyList
      {...props}
      renderItem={(key, { onRevoke, onRegenerate }) => (
        <Card key={key.id} className="flex flex-col md:flex-row md:items-center md:justify-between">
          <CardHeader>
            <CardTitle>{key.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm">{key.keyPrefix}...</span>
              <Badge variant={key.isActive ? 'default' : 'destructive'}>
                {key.isActive ? 'Active' : 'Revoked'}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {key.permissions.map((p) => (
                <Badge key={p} variant="secondary">
                  {p}
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => onRegenerate(key.id)}>
                Regenerate
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onRevoke(key.id)}>
                Revoke
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    />
  );
}
