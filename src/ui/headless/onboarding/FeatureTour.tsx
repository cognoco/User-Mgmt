import { useState } from 'react';
import { useOnboarding } from '@/hooks/user/useOnboarding';

export interface TourStep {
  title: string;
  description: string;
  element: string;
}

export interface FeatureTourProps {
  steps: TourStep[];
  render: (props: {
    currentStep: TourStep;
    currentStepIndex: number;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    handleNext: () => void;
    handlePrevious: () => void;
  }) => React.ReactNode;
}

export function FeatureTour({ steps, render }: FeatureTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const { completeStep } = useOnboarding();

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      completeStep('features');
      setIsOpen(false);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <>
      {render({
        currentStep: steps[currentStepIndex],
        currentStepIndex,
        isOpen,
        setIsOpen,
        handleNext,
        handlePrevious,
      })}
    </>
  );
}

export default FeatureTour;
