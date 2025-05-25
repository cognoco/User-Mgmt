'use client';
import { FeatureFlagsPanel } from '@/ui/styled/admin/FeatureFlagsPanel';

export default function FeatureFlagsPage(): JSX.Element {
  return (
    <div className="container py-6 space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feature Flags</h1>
        <p className="text-muted-foreground">Toggle module features on or off.</p>
      </div>
      <FeatureFlagsPanel />
    </div>
  );
}
