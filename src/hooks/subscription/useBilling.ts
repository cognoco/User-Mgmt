import { useEffect } from 'react';
import { usePayment } from '@/hooks/user/usePayment';

/**
 * Hook exposing billing related state and actions
 * built on top of the payment store.
 */
export function useBilling() {
  const {
    paymentMethods,
    activeSubscription,
    paymentHistory,
    isLoading,
    error,
    fetchPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    fetchSubscription,
    cancelSubscription,
    fetchPaymentHistory,
  } = usePayment();

  // Fetch payment methods and history on mount
  useEffect(() => {
    fetchPaymentMethods();
    fetchPaymentHistory();
  }, [fetchPaymentMethods, fetchPaymentHistory]);

  return {
    paymentMethods,
    activeSubscription,
    paymentHistory,
    isLoading,
    error,
    fetchPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    fetchSubscription,
    cancelSubscription,
    fetchPaymentHistory,
  };
}
