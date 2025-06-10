import { ReactNode, useState } from 'react';
import { api } from '@/lib/api/axios';

export interface Invoice {
  id: string;
  number: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

export interface InvoiceGeneratorProps {
  /**
   * Render prop with invoice data and actions
   */
  render: (props: {
    invoices: Invoice[];
    isLoading: boolean;
    error: string | null;
    generateInvoice: () => Promise<void>;
    downloadInvoice: (id: string) => Promise<void>;
  }) => ReactNode;
}

/**
 * Headless InvoiceGenerator component
 */
export function InvoiceGenerator({ render }: InvoiceGeneratorProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInvoice = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post('/invoices/generate');
      setInvoices((prev) => [...prev, response.data]);
    } catch (err) {
      setError('Failed to generate invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadInvoice = async (id: string) => {
    try {
      const response = await api.get(`/invoices/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download invoice');
    }
  };

  return (
    <>{render({ invoices, isLoading, error, generateInvoice, downloadInvoice })}</>
  );
}
