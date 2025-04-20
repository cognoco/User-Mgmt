import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ShieldAlert, ShieldCheck, KeyRound } from 'lucide-react';
import { api } from '@/lib/api/axios';
import { useAuthStore } from '@/lib/stores/auth.store';
import { TwoFactorSetup } from './TwoFactorSetup';
import { BackupCodesDisplay } from './BackupCodesDisplay';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function MFAManagementSection() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showSetup, setShowSetup] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [password, setPassword] = useState('');

  // Check if MFA is enabled when the component mounts
  useEffect(() => {
    checkMFAStatus();
  }, [user]);

  const checkMFAStatus = () => {
    if (!user) return;
    
    // Check user metadata for MFA status
    const isMfaEnabled = user.user_metadata?.totpEnabled === true;
    setMfaEnabled(isMfaEnabled);
    
    // If backup codes exist in metadata, make them available
    if (isMfaEnabled && user.user_metadata?.backupCodes) {
      setBackupCodes(user.user_metadata.backupCodes);
    }
  };

  const handleSetupComplete = () => {
    setShowSetup(false);
    checkMFAStatus();
    setSuccess(t('mfa.management.setupSuccess'));
  };

  const handleDisableMFA = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      await api.post('/api/2fa/disable', { password });
      
      setMfaEnabled(false);
      setBackupCodes([]);
      setShowDisableConfirm(false);
      setSuccess(t('mfa.management.disableSuccess'));
    } catch (error: any) {
      setError(error.response?.data?.error || t('mfa.management.disableError'));
    } finally {
      setIsLoading(false);
      setPassword('');
    }
  };

  const fetchBackupCodes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post('/api/2fa/backup-codes');
      setBackupCodes(response.data.codes);
      setShowBackupCodes(true);
    } catch (error: any) {
      setError(error.response?.data?.error || t('mfa.management.backupCodesError'));
    } finally {
      setIsLoading(false);
    }
  };

  // The main MFA management UI
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {t('mfa.management.title')}
        </CardTitle>
        <CardDescription>
          {t('mfa.management.description')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        {mfaEnabled ? (
          // MFA is enabled - show management options
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-800 rounded-md">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-medium">{t('mfa.management.enabled')}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowBackupCodes(true)}
              >
                <KeyRound className="h-4 w-4 mr-2" />
                {t('mfa.management.viewBackupCodes')}
              </Button>
              
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={() => setShowDisableConfirm(true)}
              >
                <ShieldAlert className="h-4 w-4 mr-2" />
                {t('mfa.management.disable')}
              </Button>
            </div>
          </div>
        ) : (
          // MFA is disabled - show setup option
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 rounded-md">
              <ShieldAlert className="h-5 w-5" />
              <span className="font-medium">{t('mfa.management.disabled')}</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {t('mfa.management.setupPrompt')}
            </p>
            
            <Button onClick={() => setShowSetup(true)}>
              {t('mfa.management.setupButton')}
            </Button>
          </div>
        )}

        {/* MFA Setup Dialog */}
        {showSetup && (
          <Dialog open={showSetup} onOpenChange={setShowSetup}>
            <DialogContent className="sm:max-w-lg">
              <TwoFactorSetup 
                onComplete={handleSetupComplete}
                onCancel={() => setShowSetup(false)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Backup Codes Dialog */}
        <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
          <DialogContent className="sm:max-w-lg">
            <BackupCodesDisplay
              existingCodes={backupCodes}
              onClose={() => setShowBackupCodes(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Disable MFA Confirmation Dialog */}
        <Dialog open={showDisableConfirm} onOpenChange={setShowDisableConfirm}>
          <DialogContent className="sm:max-w-lg">
            <CardHeader>
              <CardTitle className="text-destructive">
                {t('mfa.management.disableConfirmTitle')}
              </CardTitle>
              <CardDescription>
                {t('mfa.management.disableConfirmDescription')}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>
                  {t('mfa.management.disableWarning')}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('common.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('common.passwordPlaceholder')}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowDisableConfirm(false);
                    setPassword('');
                  }}
                >
                  {t('common.cancel')}
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDisableMFA}
                  disabled={isLoading || !password}
                >
                  {isLoading ? t('common.loading') : t('mfa.management.confirmDisable')}
                </Button>
              </div>
            </CardContent>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
} 