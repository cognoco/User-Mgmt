import { useOnboarding } from '@/hooks/user/useOnboarding';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  order: number;
}

export interface ProgressTrackerProps {
  render: (props: { steps: OnboardingStep[]; progress: number }) => React.ReactNode;
}

export function ProgressTracker({ render }: ProgressTrackerProps) {
  const { steps, progress } = useOnboarding();
  return <>{render({ steps, progress })}</>;
}

export default ProgressTracker;
