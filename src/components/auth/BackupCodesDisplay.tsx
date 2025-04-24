import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/lib/api/axios';

interface BackupCodesDisplayProps {
  existingCodes?: string[];
  showRegenerateOption?: boolean;
  onClose?: () => void;
}

export function BackupCodesDisplay({ 
  existingCodes, 
  showRegenerateOption = true,
  onClose 
}: BackupCodesDisplayProps) {
  const { t } = useTranslation();
  const [codes, setCodes] = useState<string[]>(existingCodes || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regenerateConfirmVisible, setRegenerateConfirmVisible] = useState(false);

  const generateNewCodes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post('/api/2fa/backup-codes');
      setCodes(response.data.codes);
      setRegenerateConfirmVisible(false);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to generate backup codes');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (codes.length > 0) {
      navigator.clipboard.writeText(codes.join('\n'))
        .then(() => {
          alert(t('2fa.backupCodes.copied'));
        })
        .catch(() => {
          alert(t('2fa.backupCodes.copyFailed'));
        });
    }
  };

  const downloadCodes = () => {
    if (codes.length > 0) {
      const content = `# ${t('2fa.backupCodes.title')} - ${new Date().toLocaleDateString()}\n\n${codes.join('\n')}\n\n${t('2fa.backupCodes.warning')}`;
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('2fa.backupCodes.title')}</CardTitle>
        <CardDescription>
          {t('2fa.backupCodes.description')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!regenerateConfirmVisible ? (
          <>
            <Alert className="mb-4" role="alert">
              <AlertDescription>
                {t('2fa.backupCodes.saveWarning')}
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-2 gap-2">
              {codes.map((code, index) => (
                <div key={index} className="font-mono text-sm p-2 bg-muted rounded">
                  {code}
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={copyToClipboard} size="sm">
                {t('common.copy')}
              </Button>
              <Button variant="outline" onClick={downloadCodes} size="sm">
                {t('common.download')}
              </Button>
              
              {showRegenerateOption && (
                <Button 
                  variant="destructive" 
                  onClick={() => setRegenerateConfirmVisible(true)}
                  size="sm"
                  className="ml-auto"
                >
                  {t('2fa.backupCodes.regenerate')}
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <Alert variant="destructive" role="alert">
              <AlertDescription>
                {t('2fa.backupCodes.regenerateWarning')}
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                onClick={generateNewCodes}
                disabled={isLoading}
              >
                {isLoading ? t('common.loading') : t('2fa.backupCodes.confirmRegenerate')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setRegenerateConfirmVisible(false)}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        {onClose && (
          <Button className="w-full" onClick={onClose}>
            {t('common.close')}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 