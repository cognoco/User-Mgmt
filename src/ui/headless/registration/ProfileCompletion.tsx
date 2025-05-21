/**
 * Headless Profile Completion Component
 *
 * Manages profile details state and completion submission.
 */
import { useState } from 'react';

export interface ProfileCompletionProps {
  onSubmit?: (data: Record<string, any>) => Promise<void>;
  render: (props: {
    values: Record<string, any>;
    setValue: (field: string, value: any) => void;
    handleSubmit: (e: React.FormEvent) => void;
  }) => React.ReactNode;
}

export function ProfileCompletion({ onSubmit, render }: ProfileCompletionProps) {
  const [values, setValues] = useState<Record<string, any>>({});

  const setValue = (field: string, value: any) => setValues(v => ({ ...v, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit?.(values);
  };

  return <>{render({ values, setValue, handleSubmit })}</>;
}
