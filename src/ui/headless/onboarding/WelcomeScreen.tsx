import { useEffect } from 'react';
import { useOnboarding } from '@/hooks/user/useOnboarding';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  order: number;
}

export interface WelcomeScreenProps {
  render: (props: {
    steps: OnboardingStep[];
    currentStep?: OnboardingStep;
    progress: number;
    handleNext: () => void;
  }) => React.ReactNode;
}

export function WelcomeScreen({ render }: WelcomeScreenProps) {
  const {
    steps,
    currentStepId,
    progress,
    setCurrentStep,
    completeStep,
    setHasSeenWelcome,
  } = useOnboarding();

  useEffect(() => {
    setHasSeenWelcome(true);
  }, [setHasSeenWelcome]);

  const currentStep = steps.find((step) => step.id === currentStepId);

  const handleNext = () => {
    if (currentStep) {
      completeStep(currentStep.id);
      const nextStep = steps.find((step) => step.order === currentStep.order + 1);
      if (nextStep) {
        setCurrentStep(nextStep.id);
      }
    }
  };

  return <>{render({ steps, currentStep, progress, handleNext })}</>;
}

export default WelcomeScreen;
