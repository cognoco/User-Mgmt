'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { api } from '@/lib/api/axios'; // Assuming api setup
import { KeyRound, AlertCircle, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

interface BusinessSSOSetupProps {
    orgId: string;
    onSettingsChange?: (settings: { sso_enabled: boolean; idp_type: 'saml' | 'oidc' | null }) => void;
}

interface SSOSettings {
    sso_enabled: boolean;
    idp_type: 'saml' | 'oidc' | null;
}

const BusinessSSOSetup: React.FC<BusinessSSOSetupProps> = ({ orgId, onSettingsChange }) => {
    const { t } = useTranslation();
    const [ssoEnabled, setSsoEnabled] = useState<boolean>(false);
    const [idpType, setIdpType] = useState<'saml' | 'oidc' | null>(null);
    const [initialSettings, setInitialSettings] = useState<SSOSettings | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await api.get<SSOSettings>(`/organizations/${orgId}/sso/settings`);
            setSsoEnabled(response.data.sso_enabled);
            setIdpType(response.data.idp_type);
            setInitialSettings(response.data);
        } catch (err) {
            if (process.env.NODE_ENV === 'development') { console.error("Failed to fetch SSO settings:", err); }
            setError(t('org.sso.fetchError'));
            setInitialSettings({ sso_enabled: false, idp_type: null }); // Set default on error
        } finally {
            setIsLoading(false);
        }
    }, [orgId]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setSuccess(null);
        try {
            const payload: SSOSettings = {
                sso_enabled: ssoEnabled,
                idp_type: ssoEnabled ? idpType : null, // Only save idp_type if SSO is enabled
            };
            await api.put(`/organizations/${orgId}/sso/settings`, payload);
            setInitialSettings(payload); // Update initial settings on successful save
            setSuccess(t('org.sso.saveSuccess'));
            if (onSettingsChange) {
                onSettingsChange(payload);
            }
            // Optionally refetch or just update state
            // fetchSettings(); // Could refetch to ensure sync
        } catch (err) {
            if (process.env.NODE_ENV === 'development') { console.error("Failed to save SSO settings:", err); }
            setError(t('org.sso.saveError'));
        } finally {
            setIsSaving(false);
        }
    };

    const hasChanges = initialSettings
        ? ssoEnabled !== initialSettings.sso_enabled || (ssoEnabled && idpType !== initialSettings.idp_type)
        : ssoEnabled || idpType !== null; // If initial fetch failed, any enablement is a change

    const handleSwitchChange = (checked: boolean) => {
        setSsoEnabled(checked);
        if (!checked) {
            setIdpType(null); // Reset IDP type if SSO is disabled
        }
        setError(null); // Clear messages on change
        setSuccess(null);
    }

    const handleSelectChange = (value: string) => {
        if (value === 'saml' || value === 'oidc') {
            setIdpType(value);
            setError(null); // Clear messages on change
            setSuccess(null);
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4 mt-1" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-12" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
                <CardFooter className="flex justify-between">
                     <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        );
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <KeyRound className="h-5 w-5" />
                    {t('org.sso.title')}
                </CardTitle>
                <CardDescription>{t('org.sso.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {success && (
                     <Alert variant="default" className="bg-green-50 border border-green-200 text-green-700">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                <div className="flex items-center justify-between space-x-2 border p-4 rounded-md">
                    <Label htmlFor="sso-enabled" className="flex flex-col space-y-1">
                        <span>{t('org.sso.enableLabel')}</span>
                        <span className="font-normal leading-snug text-muted-foreground text-sm">
                             {t('org.sso.enableDescription')}
                        </span>
                    </Label>
                    <Switch
                        id="sso-enabled"
                        checked={ssoEnabled}
                        onCheckedChange={handleSwitchChange}
                        disabled={isSaving}
                        aria-label={t('org.sso.enableLabel')}
                    />
                </div>

                {ssoEnabled && (
                    <div className="space-y-2">
                        <Label htmlFor="idp-type">{t('org.sso.idpTypeLabel')}</Label>
                        <Select
                            value={idpType ?? ''}
                            onValueChange={handleSelectChange}
                            disabled={isSaving}
                        >
                            <SelectTrigger id="idp-type">
                                <SelectValue placeholder={t('org.sso.idpTypePlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="saml">{t('org.sso.idpTypeSaml')}</SelectItem>
                                <SelectItem value="oidc">{t('org.sso.idpTypeOidc')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                            {t('org.sso.idpTypeDescription')}
                        </p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-6">
                 <p className="text-sm text-muted-foreground">
                     {t('org.sso.footerNote')}
                 </p>
                <Button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving || (ssoEnabled && !idpType)} // Disable if enabled but no type selected
                    aria-live="polite"
                >
                    {isSaving ? t('common.saving') : t('org.sso.saveButton')}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default BusinessSSOSetup; 