import { ReactNode, useState } from 'react';
import { useForm, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

/**
 * Schema for payment form validation
 */
const paymentSchema = z.object({
  cardNumber: z.string().min(16).max(16),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/),
  cvv: z.string().min(3).max(4),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

export interface PaymentFormProps {
  /**
   * Optional submit handler. If not provided, the form simply resolves.
   */
  onSubmit?: (data: PaymentFormData) => Promise<void>;

  /**
   * Optional external loading state
   */
  isLoading?: boolean;

  /**
   * Optional external error message
   */
  error?: string | null;

  /**
   * Render prop that receives form state and handlers
   */
  render: (props: {
    register: ReturnType<typeof useForm<PaymentFormData>>['register'];
    handleSubmit: (e: React.FormEvent) => void;
    errors: FieldErrors<PaymentFormData>;
    isSubmitting: boolean;
    error?: string | null;
  }) => ReactNode;
}

/**
 * Headless Payment Form component providing form state via render props
 */
export function PaymentForm({ onSubmit, isLoading: externalIsLoading, error: externalError, render }: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit: rhfHandleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({ resolver: zodResolver(paymentSchema) });

  const isLoading = externalIsLoading !== undefined ? externalIsLoading : isSubmitting;
  const formError = externalError ?? null;

  const handleSubmit = rhfHandleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  return <>{render({ register, handleSubmit, errors, isSubmitting: isLoading, error: formError })}</>;
}
