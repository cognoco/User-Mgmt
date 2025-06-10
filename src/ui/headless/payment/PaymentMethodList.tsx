import { ReactNode, useEffect } from 'react';
import { usePayment } from '@/hooks/user/usePayment';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: string;
  expiryYear?: string;
}

export interface PaymentMethodListProps {
  /**
   * Render prop that receives payment methods and handlers
   */
  render: (props: {
    paymentMethods: PaymentMethod[];
    isLoading: boolean;
    error: string | null;
    removePaymentMethod: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
  }) => ReactNode;
}

/**
 * Headless PaymentMethodList component
 */
export function PaymentMethodList({ render }: PaymentMethodListProps) {
  const { paymentMethods, isLoading, error, fetchPaymentMethods, removePaymentMethod } = usePayment();

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  const refresh = async () => {
    await fetchPaymentMethods();
  };

  return (
    <>{render({ paymentMethods, isLoading, error, removePaymentMethod, refresh })}</>
  );
}
