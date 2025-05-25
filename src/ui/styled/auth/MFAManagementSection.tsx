import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/primitives/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Alert, AlertDescription } from '@/ui/primitives/alert';
import { Shield, ShieldAlert, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';
import { TwoFactorSetup } from './TwoFactorSetup';
import { BackupCodesDisplay } from './BackupCodesDisplay';
import { Dialog, DialogContent } from '@/ui/primitives/dialog';
import { MFAManagementSection as HeadlessMFAManagementSection, type MFAMethod } from '@/ui/headless/auth/MFAManagementSection';

export function MFAManagementSection() {
  const { t } = useTranslation();
  const user = useAuth().user;

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [removingFactor, setRemovingFactor] = useState<MFAMethod | null>(null);

  return (
    <HeadlessMFAManagementSection
      userId={user?.id}
      onUpdate={(res) => setSuccess(res.message)}
      onError={(err) => setError(err)}
    >
      {({
        configuredMethods,
        disableMethod,
        backupCodes,
        isLoading
      }) => (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('mfa.management.title')}
            </CardTitle>
            <CardDescription>{t('mfa.management.description')}</CardDescription>
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
            {configuredMethods.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-green-50 text-green-800 rounded-md">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="font-medium">{t('mfa.management.enabled')}</span>
                </div>
                <div className="space-y-2">
                  {configuredMethods.map((factor) => (
                    <div key={factor.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="font-semibold">{factor.name}</span>
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
                  <Button variant="outline" className="flex-1" onClick={() => setShowBackupCodes(true)}>
                    <KeyRound className="h-4 w-4 mr-2" />
                    {t('mfa.management.viewBackupCodes')}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setShowSetup(true)}>
                    {t('mfa.management.addAnother') || 'Add Another Factor'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 rounded-md">
                  <ShieldAlert className="h-5 w-5" />
                  <span className="font-medium">{t('mfa.management.disabled')}</span>
                </div>
                <p className="text-sm text-muted-foreground">{t('mfa.management.setupPrompt')}</p>
                <Button onClick={() => setShowSetup(true)}>{t('mfa.management.setupButton')}</Button>
              </div>
            )}

            <Dialog open={showSetup} onOpenChange={setShowSetup}>
              <DialogContent className="sm:max-w-lg">
                <TwoFactorSetup onComplete={() => setShowSetup(false)} onCancel={() => setShowSetup(false)} />
              </DialogContent>
            </Dialog>

            <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
              <DialogContent className="sm:max-w-lg">
                <BackupCodesDisplay existingCodes={backupCodes} onClose={() => setShowBackupCodes(false)} />
              </DialogContent>
            </Dialog>

            <Dialog open={!!removingFactor} onOpenChange={() => setRemovingFactor(null)}>
              <DialogContent className="sm:max-w-lg">
                <CardHeader>
                  <CardTitle className="text-destructive">
                    {t('mfa.management.removeConfirmTitle', { factor: removingFactor?.name })}
                  </CardTitle>
                  <CardDescription>
                    {t('mfa.management.removeConfirmDescription', { factor: removingFactor?.name })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setRemovingFactor(null)}>
                    {t('common.cancel')}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (removingFactor) {
                        const ok = await disableMethod(removingFactor.id);
                        if (ok) {
                          setSuccess(t('mfa.management.removeSuccess'));
                        }
                      }
                      setRemovingFactor(null);
                    }}
                    disabled={isLoading}
                  >
                    {t('mfa.management.remove')}
                  </Button>
                </CardContent>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </HeadlessMFAManagementSection>
  );
}
