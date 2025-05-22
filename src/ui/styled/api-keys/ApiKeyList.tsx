import { Card, CardContent, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Button } from '@/ui/primitives/button';
import { Badge } from '@/ui/primitives/badge';

export function ApiKeyList() {
  return (
    <HeadlessApiKeyList>
      {({ apiKeys, isLoading, error, revoke, regenerate }) => (
        <div className="space-y-4">
          {isLoading && <p>Loading...</p>}
          {error && (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          )}
          {apiKeys.map((key) => (
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
                  <Button size="sm" variant="outline" onClick={() => regenerate(key.id)}>
                    Regenerate
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => revoke(key.id)}>
                    Revoke
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </HeadlessApiKeyList>
  );
}
