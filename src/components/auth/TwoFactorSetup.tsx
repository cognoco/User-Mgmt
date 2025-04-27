import { useState, useEffect } from 'react';
import { use2FAStore } from '@/lib/stores/2fa.store';
import { TwoFactorMethod, type TwoFactorFactor } from '@/types/2fa';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';
import { api } from '@/lib/api/axios';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, XCircle, QrCode, Smartphone, KeyRound, Trash2, Edit, Save, Copy } from "lucide-react";
import { useUserManagement } from "@/lib/auth/UserManagementProvider";
// import { useAuthStore } from "@/lib/stores/auth.store"; // Keep commented if unused

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

  const handleMethodSelect = async (method: TwoFactorMethod) => {
    try {
      setIsLoading(true);
      setError(null);

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

  const handleVerify = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await api.post('/api/2fa/verify', {
        method: TwoFactorMethod.TOTP,
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
              disabled={isLoading || true} // Disabled until implemented
            >
              {t('2fa.methods.sms')} ({t('common.comingSoon')})
            </Button>
            <Button
              variant="outline"
              onClick={() => handleMethodSelect(TwoFactorMethod.EMAIL)}
              disabled={isLoading || true} // Disabled until implemented
            >
              {t('2fa.methods.email')} ({t('common.comingSoon')})
            </Button>
          </div>
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
            <Label htmlFor="code">{t('2fa.setup.enterCode')}</Label>
            <Input
              id="code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="000000"
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