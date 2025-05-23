import type { ReactNode } from 'react';
import { useState } from 'react';
import { useBilling } from '@/hooks/subscription/useBilling';

export interface BillingFormProps {
  onSubmit?: (paymentMethodId: string) => Promise<void>;
  render: (props: {
    paymentMethods: ReturnType<typeof useBilling>['paymentMethods'];
    isSubmitting: boolean;
    submit: (paymentMethodId: string) => Promise<void>;
    error: string | null;
  }) => ReactNode;
}

export function BillingForm({ onSubmit, render }: BillingFormProps) {
  const { paymentMethods, addPaymentMethod, error } = useBilling();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (paymentMethodId: string) => {
    setIsSubmitting(true);
    try {
      if (onSubmit) await onSubmit(paymentMethodId);
      else await addPaymentMethod({ id: paymentMethodId, type: 'card' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return <>{render({ paymentMethods, isSubmitting, submit, error })}</>;
}
