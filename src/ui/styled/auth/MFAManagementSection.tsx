import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/primitives/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Alert, AlertDescription } from '@/ui/primitives/alert';
import { Shield, ShieldAlert, ShieldCheck, KeyRound } from 'lucide-react';
import { api } from '@/lib/api/axios';
import { useAuth } from '@/hooks/auth/useAuth';
import { TwoFactorSetup } from './TwoFactorSetup';
import { BackupCodesDisplay } from './BackupCodesDisplay';
import { Dialog, DialogContent } from '@/ui/primitives/dialog';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';

export function MFAManagementSection() {
  const { t } = useTranslation();
  const user = useAuth().user;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
    if ((user.user_metadata?.totpEnabled === true || user.user_metadata?.mfaSmsVerified) && user.user_metadata?.backupCodes) {
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

  // Helper to get enrolled MFA methods
  const getEnrolledFactors = () => {
    if (!user) return [];
    const methods = Array.isArray(user.user_metadata?.mfaMethods)
      ? user.user_metadata.mfaMethods
      : [];
    const factors = [];
    if (methods.includes('totp') || user.user_metadata?.totpEnabled) {
      factors.push({
        type: 'totp',
        label: t('mfa.management.factor.totp'),
        detail: '',
        enabled: true,
      });
    }
    if (methods.includes('sms') || user.user_metadata?.mfaSmsVerified) {
      factors.push({
        type: 'sms',
        label: t('mfa.management.factor.sms'),
        detail: user.user_metadata?.mfaPhone ? `••••${user.user_metadata.mfaPhone.slice(-4)}` : '',
        enabled: true,
      });
    }
    if (methods.includes('email') || user.user_metadata?.mfaEmailVerified) {
      factors.push({
        type: 'email',
        label: t('mfa.management.factor.email'),
        detail: user.user_metadata?.mfaEmail || user.email || '',
        enabled: true,
      });
    }
    return factors;
  };

  const [removingFactor, setRemovingFactor] = useState<null | { type: string; label: string }>(null);

  const handleRemoveFactor = async (factorType: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/api/2fa/disable', { method: factorType });
      setRemovingFactor(null);
      checkMFAStatus();
      setSuccess(t('mfa.management.removeSuccess'));
    } catch (error: any) {
      setError(error.response?.data?.error || t('mfa.management.removeError'));
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
          <Alert variant="destructive" role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-green-50 border-green-200 text-green-800" role="alert">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        {getEnrolledFactors().length > 0 ? (
          // MFA is enabled - show management options
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-800 rounded-md">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-medium">{t('mfa.management.enabled')}</span>
            </div>
            <div className="space-y-2">
              {getEnrolledFactors().map(factor => (
                <div key={factor.type} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-semibold">{factor.label}</span>
                    {factor.detail && <span className="ml-2 text-muted-foreground">{factor.detail}</span>}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setRemovingFactor(factor)}
                    disabled={isLoading}
                  >
                    {t('mfa.management.remove')}
                  </Button>
                </div>
              ))}
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
                variant="outline" 
                className="flex-1"
                onClick={() => setShowSetup(true)}
              >
                {t('mfa.management.addAnother') || 'Add Another Factor'}
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
              <Alert variant="destructive" role="alert">
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

        {/* Remove Factor Confirmation Dialog */}
        <Dialog open={!!removingFactor} onOpenChange={() => setRemovingFactor(null)}>
          <DialogContent className="sm:max-w-lg">
            <CardHeader>
              <CardTitle className="text-destructive">
                {t('mfa.management.removeConfirmTitle', { factor: removingFactor?.label })}
              </CardTitle>
              <CardDescription>
                {t('mfa.management.removeConfirmDescription', { factor: removingFactor?.label })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive" role="alert">
                <AlertDescription>
                  {t('mfa.management.removeWarning', { factor: removingFactor?.label })}
                </AlertDescription>
              </Alert>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setRemovingFactor(null)}>
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleRemoveFactor(removingFactor?.type || '')}
                  disabled={isLoading}
                >
                  {t('mfa.management.remove')}
                </Button>
              </div>
            </CardContent>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
} 