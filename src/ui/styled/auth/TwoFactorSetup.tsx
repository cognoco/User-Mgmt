import { useState, useEffect } from 'react';
// import { use2FAStore } from '@/lib/stores/2fa.store'; // Unused
import { TwoFactorMethod } from '@/types/2fa';
import { Button } from '@/ui/primitives/button';
import { Card } from '@/ui/primitives/card';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import { Alert, AlertDescription } from '@/ui/primitives/alert';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api/axios';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/primitives/dialog"; // Unused
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/primitives/tabs"; // Unused
// import { Loader2, CheckCircle, XCircle, QrCode, Smartphone, KeyRound, Trash2, Edit, Save, Copy } from "lucide-react"; // Unused
// import { useUserManagement } from "@/lib/auth/UserManagementProvider"; // Unused
// import { useAuth } from '@/hooks/auth/useAuth'; // Keep commented if unused

interface TwoFactorSetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'method' | 'verify' | 'backup'>('method');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<TwoFactorMethod | null>(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);

  const handleMethodSelect = async (method: TwoFactorMethod) => {
    setSelectedMethod(method);
    setError(null);
    if (method === TwoFactorMethod.SMS) {
      setShowPhoneInput(true);
      setShowEmailInput(false);
      setStep('method');
      return;
    }
    if (method === TwoFactorMethod.EMAIL) {
      setShowEmailInput(true);
      setShowPhoneInput(false);
      setStep('method');
      return;
    }
    try {
      setIsLoading(true);
      const response = await api.post('/api/2fa/setup', { method });
      if (method === TwoFactorMethod.TOTP) {
        setQrCode(response.data.qrCode);
        setSecret(response.data.secret);
      }
      setStep('verify');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to set up 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSmsSetup = async () => {
    setError(null);
    try {
      setIsLoading(true);
      await api.post('/api/2fa/setup', { method: TwoFactorMethod.SMS, phone });
      setStep('verify');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to send SMS code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSetup = async () => {
    setError(null);
    try {
      setIsLoading(true);
      await api.post('/api/2fa/setup', { method: TwoFactorMethod.EMAIL, email });
      setStep('verify');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to send email code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await api.post('/api/2fa/verify', {
        method: selectedMethod || TwoFactorMethod.TOTP,
        code: verificationCode,
      });
      // Generate backup codes
      const backupResponse = await api.post('/api/2fa/backup-codes');
      setBackupCodes(backupResponse.data.codes);
      setStep('backup');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to verify 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete?.();
  };

  // Clear any errors when component unmounts
  useEffect(() => {
    return () => {
      setError(null);
    };
  }, []);

  const copyBackupCodes = () => {
    if (backupCodes.length > 0) {
      navigator.clipboard.writeText(backupCodes.join('\n'))
        .then(() => {
          alert(t('2fa.setup.copiedToClipboard'));
        })
        .catch(() => {
          alert(t('2fa.setup.copyFailed'));
        });
    }
  };

  const downloadBackupCodes = () => {
    if (backupCodes.length > 0) {
      const content = `# Backup Codes for ${t('appName')}\n\n${backupCodes.join('\n')}\n\n${t('2fa.setup.backupCodesWarning')}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'backup-codes.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Card className="w-full max-w-md p-6">
      <h2 className="text-2xl font-bold mb-6">{t('2fa.setup.title')}</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === 'method' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('2fa.setup.selectMethod')}</h3>
          <div className="grid gap-4">
            <Button
              variant="outline"
              onClick={() => handleMethodSelect(TwoFactorMethod.TOTP)}
              disabled={isLoading}
            >
              {t('2fa.methods.totp')}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleMethodSelect(TwoFactorMethod.SMS)}
              disabled={isLoading}
            >
              {t('2fa.methods.sms')}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleMethodSelect(TwoFactorMethod.EMAIL)}
              disabled={isLoading}
            >
              {t('2fa.methods.email')}
            </Button>
          </div>
          {showPhoneInput && (
            <div className="space-y-2 mt-4">
              <Label htmlFor="phone">{t('2fa.setup.sms.enterPhone')}</Label>
              <Input
                id="phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+1234567890"
                disabled={isLoading}
              />
              <Button onClick={handleSmsSetup} disabled={isLoading || !phone}>
                {t('2fa.setup.sms.sendCode') || 'Send Code'}
              </Button>
              <Button variant="outline" onClick={() => setShowPhoneInput(false)}>
                {t('common.back')}
              </Button>
            </div>
          )}
          {showEmailInput && (
            <div className="space-y-2 mt-4">
              <Label htmlFor="email">{t('2fa.setup.email.enterEmail')}</Label>
              <Input
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@example.com"
                disabled={isLoading}
              />
              <Button onClick={handleEmailSetup} disabled={isLoading || !email}>
                {t('2fa.setup.email.sendCode') || 'Send Code'}
              </Button>
              <Button variant="outline" onClick={() => setShowEmailInput(false)}>
                {t('common.back')}
              </Button>
            </div>
          )}
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('2fa.setup.verify')}</h3>
          {qrCode && (
            <div className="flex flex-col items-center mb-4">
              <img src={qrCode} alt="QR Code" className="mb-2 w-48 h-48" />
              {secret && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">{t('2fa.setup.manualCode')}</p>
                  <code className="px-2 py-1 bg-muted rounded text-sm">{secret}</code>
                </div>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="code">{selectedMethod === TwoFactorMethod.SMS ? t('2fa.setup.sms.verifyCode') : selectedMethod === TwoFactorMethod.EMAIL ? t('2fa.setup.email.verifyCode') : t('2fa.setup.enterCode')}</Label>
            <Input
              id="code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder={selectedMethod === TwoFactorMethod.SMS ? '000000' : selectedMethod === TwoFactorMethod.EMAIL ? 'user@example.com' : '000000'}
              maxLength={6}
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleVerify} disabled={isLoading || verificationCode.length !== 6}>
              {t('2fa.setup.verify')}
            </Button>
            <Button variant="outline" onClick={() => setStep('method')}>
              {t('common.back')}
            </Button>
          </div>
        </div>
      )}

      {step === 'backup' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('2fa.setup.backupCodes')}</h3>
          <Alert>
            <AlertDescription>{t('2fa.setup.saveBackupCodes')}</AlertDescription>
          </Alert>
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((code, index) => (
              <div key={index} className="font-mono text-sm p-2 bg-muted rounded">
                {code}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyBackupCodes}>
              {t('common.copy')}
            </Button>
            <Button variant="outline" onClick={downloadBackupCodes}>
              {t('common.download')}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleComplete}>
              {t('2fa.setup.complete')}
            </Button>
            <Button variant="outline" onClick={() => setStep('verify')}>
              {t('common.back')}
            </Button>
          </div>
        </div>
      )}

      {onCancel && (
        <Button variant="ghost" className="mt-4" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
      )}
    </Card>
  );
} 