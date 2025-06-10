import { ReactNode, useState } from 'react';
import { useOnboarding } from '@/hooks/user/useOnboarding';

export interface SetupStep {
  id: string;
  title: string;
  component: ReactNode;
}

export interface SetupWizardProps {
  steps: SetupStep[];
  render: (props: {
    currentStep: SetupStep;
    currentStepIndex: number;
    progress: number;
    handleNext: () => void;
    handlePrevious: () => void;
    setCurrentStepIndex: (index: number) => void;
  }) => React.ReactNode;
}

export function SetupWizard({ steps, render }: SetupWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { completeStep } = useOnboarding();

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      completeStep('settings');
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <>
      {render({
        currentStep: steps[currentStepIndex],
        currentStepIndex,
        progress,
        handleNext,
        handlePrevious,
        setCurrentStepIndex,
      })}
    </>
  );
}

export default SetupWizard;
