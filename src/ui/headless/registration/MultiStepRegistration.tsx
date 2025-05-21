/**
 * Headless Multi Step Registration Component
 *
 * Provides basic multi step flow logic without rendering UI.
 */
import { useState } from 'react';

export interface MultiStepRegistrationProps {
  steps: string[];
  onComplete?: (data: Record<string, any>) => Promise<void>;
  render: (props: {
    currentStep: number;
    next: () => void;
    back: () => void;
    setValue: (key: string, value: any) => void;
    values: Record<string, any>;
    handleSubmit: (e: React.FormEvent) => void;
  }) => React.ReactNode;
}

export function MultiStepRegistration({ steps, onComplete, render }: MultiStepRegistrationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<Record<string, any>>({});

  const setValue = (key: string, value: any) => setValues(v => ({ ...v, [key]: value }));

  const next = () => setCurrentStep(s => Math.min(s + 1, steps.length - 1));
  const back = () => setCurrentStep(s => Math.max(s - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < steps.length - 1) {
      next();
    } else {
      await onComplete?.(values);
    }
  };

  return <>{render({ currentStep, next, back, setValue, values, handleSubmit })}</>;
}
