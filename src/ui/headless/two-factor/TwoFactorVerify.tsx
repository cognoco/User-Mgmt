import { useState } from 'react';
import { useMFA } from '@/hooks/auth/useMFA';

export interface TwoFactorVerifyRenderProps {
  code: string;
  setCode: (code: string) => void;
  submit: () => Promise<void>;
  loading: boolean;
  error?: string;
}

export interface TwoFactorVerifyProps {
  onSuccess?: () => void;
  children: (props: TwoFactorVerifyRenderProps) => React.ReactNode;
}

export function TwoFactorVerify({ onSuccess, children }: TwoFactorVerifyProps) {
  const { verifyMFA, isLoading, error } = useMFA();
  const [code, setCode] = useState('');

  const submit = async () => {
    const res = await verifyMFA(code);
    if (res.success) {
      onSuccess?.();
    }
  };

  return <>{children({ code, setCode, submit, loading: isLoading, error: error || undefined })}</>;
}

export default TwoFactorVerify;
