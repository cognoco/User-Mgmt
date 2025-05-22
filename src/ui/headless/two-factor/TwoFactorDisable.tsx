import { useState } from 'react';
import { useMFA } from '@/hooks/auth/useMFA';

export interface TwoFactorDisableRenderProps {
  code: string;
  setCode: (code: string) => void;
  submit: () => Promise<void>;
  loading: boolean;
  error?: string;
}

export interface TwoFactorDisableProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  children: (props: TwoFactorDisableRenderProps) => React.ReactNode;
}

export function TwoFactorDisable({ onSuccess, onCancel, children }: TwoFactorDisableProps) {
  const { disableMFA, isLoading, error } = useMFA();
  const [code, setCode] = useState('');

  const submit = async () => {
    const res = await disableMFA(code);
    if (res.success) {
      onSuccess?.();
    }
  };

  return <>{children({ code, setCode, submit, loading: isLoading, error: error || undefined })}</>;
}

export default TwoFactorDisable;
