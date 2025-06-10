import { useState } from 'react';
import { useMFA } from '@/hooks/auth/useMFA';

export interface TwoFactorSetupRenderProps {
  step: 'initial' | 'verify' | 'complete';
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
  start: () => Promise<void>;
  verify: (code: string) => Promise<void>;
  cancel: () => void;
  loading: boolean;
  error?: string;
}

export interface TwoFactorSetupProps {
  onComplete?: (codes: string[]) => void;
  onCancel?: () => void;
  children: (props: TwoFactorSetupRenderProps) => React.ReactNode;
}

export function TwoFactorSetup({ onComplete, onCancel, children }: TwoFactorSetupProps) {
  const { setupMFA, verifyMFA, isLoading, error } = useMFA();
  const [step, setStep] = useState<'initial' | 'verify' | 'complete'>('initial');
  const [secret, setSecret] = useState<string | undefined>();
  const [qrCode, setQrCode] = useState<string | undefined>();
  const [backupCodes, setBackupCodes] = useState<string[] | undefined>();

  const start = async () => {
    const res = await setupMFA();
    if (res.success) {
      setSecret(res.secret);
      setQrCode(res.qrCode);
      setStep('verify');
    }
  };

  const verify = async (code: string) => {
    const res = await verifyMFA(code);
    if (res.success) {
      setBackupCodes(res.backupCodes);
      setStep('complete');
      onComplete?.(res.backupCodes ?? []);
    }
  };

  const cancel = () => {
    onCancel?.();
  };

  return (
    <>{children({ step, secret, qrCode, backupCodes, start, verify, cancel, loading: isLoading, error: error || undefined })}</>
  );
}

export default TwoFactorSetup;
