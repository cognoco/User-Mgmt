import { useState, useId } from 'react';

/**
 * Headless FormWithRecovery
 *
 * Provides simple form submission with error handling.
 */
export interface FormWithRecoveryProps {
  onSubmit: (data: any) => Promise<void>;
  title?: string;
  render: (props: {
    formData: { name: string };
    setFormData: (val: { name: string }) => void;
    error: string | null;
    isSubmitting: boolean;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    nameInputId: string;
  }) => React.ReactNode;
}

export default function FormWithRecovery({ onSubmit, render }: FormWithRecoveryProps) {
  const [formData, setFormData] = useState({ name: '' });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameInputId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>{render({ formData, setFormData, error, isSubmitting, handleSubmit, nameInputId })}</>
  );
}
