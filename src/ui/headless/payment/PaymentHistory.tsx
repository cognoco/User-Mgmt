import { ReactNode, useEffect } from 'react';
import { usePayment } from '@/hooks/user/usePayment';

export interface PaymentHistoryItem {
  id: string;
  amount: number;
  status: 'succeeded' | 'failed' | 'pending';
  date: string;
  description: string;
}

export interface PaymentHistoryProps {
  /**
   * Render prop with payment history data
   */
  render: (props: {
    paymentHistory: PaymentHistoryItem[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
  }) => ReactNode;
}

/**
 * Headless PaymentHistory component
 */
export function PaymentHistory({ render }: PaymentHistoryProps) {
  const { paymentHistory, isLoading, error, fetchPaymentHistory } = usePayment();

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  const refresh = async () => {
    await fetchPaymentHistory();
  };

  return (
    <>{render({ paymentHistory, isLoading, error, refresh })}</>
  );
}
