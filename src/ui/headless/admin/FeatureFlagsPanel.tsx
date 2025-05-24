import { useEffect, useState } from 'react';
import type { FeatureFlags } from '@/core/config/interfaces';
import { configureFeatures, getConfiguration } from '@/core/config';

export interface FeatureFlagsPanelProps {
  render: (props: {
    featureFlags: FeatureFlags;
    toggleFeature: (name: keyof FeatureFlags, value: boolean) => void;
  }) => React.ReactNode;
}

export function FeatureFlagsPanel({ render }: FeatureFlagsPanelProps) {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(
    getConfiguration().featureFlags
  );

  useEffect(() => {
    setFeatureFlags(getConfiguration().featureFlags);
  }, []);

  const toggleFeature = (name: keyof FeatureFlags, value: boolean) => {
    const updated = configureFeatures({ [name]: value });
    setFeatureFlags(updated);
  };

  return <>{render({ featureFlags, toggleFeature })}</>;
}

export default FeatureFlagsPanel;
