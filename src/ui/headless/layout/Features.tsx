import { ReactNode } from 'react';
import { Box, Layers, Zap } from 'lucide-react';

export interface FeatureItem {
  name: ReactNode;
  description: ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  href?: string;
}

export interface FeaturesProps {
  title?: ReactNode;
  description?: ReactNode;
  features?: FeatureItem[];
  children: (props: {
    title: ReactNode;
    description: ReactNode;
    features: FeatureItem[];
  }) => React.ReactNode;
}

const defaultTitle = 'Everything you need to build modern apps';
const defaultDescription =
  'Start with our comprehensive library of components and templates. Focus on your unique features while we handle the fundamentals.';

const defaultFeatures: FeatureItem[] = [
  {
    name: 'Modular Components',
    description: 'Build your application with reusable, production-ready components.',
    icon: Box,
  },
  {
    name: 'Flexible Architecture',
    description: 'Designed to scale with your needs, from simple apps to complex systems.',
    icon: Layers,
  },
  {
    name: 'Lightning Fast',
    description: 'Optimized for performance with modern web technologies.',
    icon: Zap,
  },
];

export function Features({
  title = defaultTitle,
  description = defaultDescription,
  features,
  children,
}: FeaturesProps) {
  const items = features ?? defaultFeatures;
  return <>{children({ title, description, features: items })}</>;
}
