'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/primitives/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/ui/primitives/form';
import { Input } from '@/ui/primitives/input';
import { Textarea } from '@/ui/primitives/textarea';
import { Button } from '@/ui/primitives/button';
import { Alert, AlertDescription } from '@/ui/primitives/alert';
import { KeyRound, AlertCircle, CheckCircle, Upload } from 'lucide-react';
import { api } from '@/lib/api/axios';
import { Skeleton } from '@/ui/primitives/skeleton';
import { CopyButton } from '@/ui/primitives/copy-button'; // Assuming you have this component
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/primitives/tabs';
import { isValidUrl } from '@/lib/utils'; // Assuming a utility function to validate URLs

// SAML Schema
const samlSchema = z.object({
  entity_id: z.string().min(1, { message: 'Entity ID is required' }),
  sign_in_url: z.string().min(1, { message: 'Sign-in URL is required' }).refine(isValidUrl, {
    message: 'Please enter a valid URL',
  }),
  sign_out_url: z.string().optional().refine((val) => !val || isValidUrl(val), {
    message: 'Please enter a valid URL',
  }),
  certificate: z.string().min(1, { message: 'X.509 certificate is required' }),
  attribute_mapping: z.object({
    email: z.string().min(1, { message: 'Email attribute mapping is required' }),
    name: z.string().optional(),
    role: z.string().optional(),
  }),
});

// OIDC Schema
const oidcSchema = z.object({
  client_id: z.string().min(1, { message: 'Client ID is required' }),
  client_secret: z.string().min(1, { message: 'Client Secret is required' }),
  discovery_url: z.string().min(1, { message: 'Discovery URL is required' }).refine(isValidUrl, {
    message: 'Please enter a valid URL',
  }),
  scopes: z.string().min(1, { message: 'Scopes are required' }),
  attribute_mapping: z.object({
    email: z.string().min(1, { message: 'Email claim mapping is required' }),
    name: z.string().optional(),
    role: z.string().optional(),
  }),
});

// Combine both schemas based on type
const idpConfigSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('saml'), ...samlSchema.shape }),
  z.object({ type: z.literal('oidc'), ...oidcSchema.shape }),
]);

type SamlConfig = z.infer<typeof samlSchema> & { type: 'saml' };
type OidcConfig = z.infer<typeof oidcSchema> & { type: 'oidc' };
type IdpConfig = SamlConfig | OidcConfig;

interface IDPConfigurationProps {
  orgId: string;
  idpType: 'saml' | 'oidc';
  onConfigurationUpdate?: (success: boolean) => void;
}

const IDPConfiguration: React.FC<IDPConfigurationProps> = ({ orgId, idpType, onConfigurationUpdate }) => {
  console.log('[DEBUG] IDPConfiguration component mounted', { orgId, idpType });
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'config' | 'metadata'>('config');
  const [metadataUrl, setMetadataUrl] = useState<string>('');
  const [spEntityId, setSpEntityId] = useState<string>('');
  const [spMetadata, setSpMetadata] = useState<string>('');
  
  // Initialize form based on IDP type
  const form = useForm<IdpConfig>({
    resolver: zodResolver(idpConfigSchema),
    defaultValues: {
      type: idpType,
      ...(idpType === 'saml' ? {
        entity_id: '',
        sign_in_url: '',
        sign_out_url: '',
        certificate: '',
        attribute_mapping: {
          email: 'email',
          name: 'name',
          role: '',
        }
      } : {
        client_id: '',
        client_secret: '',
        discovery_url: '',
        scopes: 'openid email profile',
        attribute_mapping: {
          email: 'email',
          name: 'name',
          role: '',
        }
      })
    },
  });

  // Add debug before useEffect
  console.log('[DEBUG] Before useEffect', { orgId, idpType });

  // Reset form when IDP type changes
  useEffect(() => {
    console.log('[DEBUG] useEffect (start)', { orgId, idpType });
    form.reset({
      type: idpType,
      ...(idpType === 'saml' 
        ? {
          entity_id: '',
          sign_in_url: '',
          sign_out_url: '',
          certificate: '',
          attribute_mapping: {
            email: 'email',
            name: 'name',
            role: '',
          }
        } 
        : {
          client_id: '',
          client_secret: '',
          discovery_url: '',
          scopes: 'openid email profile',
          attribute_mapping: {
            email: 'email',
            name: 'name',
            role: '',
          }
        }) as any // Use type assertion to handle the discriminated union
    });
    setError(null);
    setSuccess(null);
    fetchConfiguration().then(() => {
      console.log('[DEBUG] fetchConfiguration completed', { orgId, idpType });
    });
  }, [idpType, orgId]);

  // Fetch existing configuration
  const fetchConfiguration = async () => {
    console.log('[DEBUG] fetchConfiguration called', { orgId, idpType });
    setIsLoading(true);
    setError(null);
    try {
      // Fetch IDP configuration
      const configResponse = await api.get(`/organizations/${orgId}/sso/${idpType}/config`);
      
      // Set form values
      if (idpType === 'saml') {
        form.reset({
          type: 'saml',
          ...configResponse.data,
        } as SamlConfig);
        // Debug: log form state after reset
        setTimeout(() => {
          console.log('Form state after reset:', form.getValues());
        }, 0);
      } else {
        form.reset({
          type: 'oidc',
          ...configResponse.data,
        } as OidcConfig);
      }

      // Fetch service provider metadata
      const metadataResponse = await api.get(`/organizations/${orgId}/sso/metadata`);
      setMetadataUrl(metadataResponse.data.url);
      setSpEntityId(metadataResponse.data.entity_id);
      setSpMetadata(metadataResponse.data.xml);
      
    } catch (err) {
      if (process.env.NODE_ENV === 'development') { console.error(`Failed to fetch ${idpType.toUpperCase()} configuration:`, err); }
      setError(t('org.sso.fetchConfigError'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: IdpConfig) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Strip the type field before sending to API
      const { type, ...configData } = data;
      
      await api.put(`/organizations/${orgId}/sso/${idpType}/config`, configData);
      setSuccess(t('org.sso.saveConfigSuccess'));
      
      if (onConfigurationUpdate) {
        onConfigurationUpdate(true);
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') { console.error(`Failed to save ${idpType.toUpperCase()} configuration:`, err); }
      setError(t('org.sso.saveConfigError'));
      
      if (onConfigurationUpdate) {
        onConfigurationUpdate(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle file upload for certificate
  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      form.setValue('certificate', content, { shouldValidate: true });
    };
    reader.readAsText(file);
  };

  if (isLoading) {
    console.log('[DEBUG] isLoading is true, rendering loading state', { orgId, idpType });
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-3/4 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-24" />
        </CardFooter>
      </Card>
    );
  }
  console.log('[DEBUG] isLoading is false, rendering main form', { orgId, idpType });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          {idpType === 'saml' 
            ? t('org.sso.samlConfigTitle') 
            : t('org.sso.oidcConfigTitle')}
        </CardTitle>
        <CardDescription>
          {idpType === 'saml' 
            ? t('org.sso.samlConfigDescription') 
            : t('org.sso.oidcConfigDescription')}
        </CardDescription>
      </CardHeader>
      
      <Tabs value={currentTab} onValueChange={(val) => setCurrentTab(val as 'config' | 'metadata')}>
        <CardContent>
          <TabsList className="mb-4">
            <TabsTrigger value="config">{t('org.sso.configTab')}</TabsTrigger>
            <TabsTrigger value="metadata">{t('org.sso.metadataTab')}</TabsTrigger>
          </TabsList>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 border border-green-200 text-green-700">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <TabsContent value="config">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {idpType === 'saml' ? (
                  // SAML Configuration Form
                  <>
                    <FormField
                      control={form.control}
                      name="entity_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('org.sso.saml.entityIdLabel')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>{t('org.sso.saml.entityIdDescription')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sign_in_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('org.sso.saml.signInUrlLabel')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>{t('org.sso.saml.signInUrlDescription')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sign_out_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('org.sso.saml.signOutUrlLabel')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>{t('org.sso.saml.signOutUrlDescription')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="certificate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('org.sso.saml.certificateLabel')}</FormLabel>
                          <FormControl>
                            <div className="flex flex-col space-y-2">
                              <Textarea 
                                {...field} 
                                rows={5} 
                                placeholder={t('org.sso.saml.certificatePlaceholder')} 
                              />
                              <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" onClick={() => document.getElementById('cert-upload')?.click()}>
                                  <Upload className="h-4 w-4 mr-2" />
                                  {t('org.sso.saml.uploadCertificate')}
                                </Button>
                                <input
                                  id="cert-upload"
                                  type="file"
                                  accept=".pem,.crt,.cer"
                                  className="hidden"
                                  onChange={handleCertificateUpload}
                                  aria-label={t('org.sso.saml.certificateLabel')}
                                />
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>{t('org.sso.saml.certificateDescription')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="attribute_mapping.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('org.sso.saml.emailMappingLabel')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>{t('org.sso.saml.emailMappingDescription')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="attribute_mapping.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('org.sso.saml.nameMappingLabel')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>{t('org.sso.saml.nameMappingDescription')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="attribute_mapping.role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('org.sso.saml.roleMappingLabel')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>{t('org.sso.saml.roleMappingDescription')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  // OIDC Configuration Form
                  <>
                    <FormField
                      control={form.control}
                      name="client_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('org.sso.oidc.clientIdLabel')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>{t('org.sso.oidc.clientIdDescription')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="client_secret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('org.sso.oidc.clientSecretLabel')}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormDescription>{t('org.sso.oidc.clientSecretDescription')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discovery_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('org.sso.oidc.discoveryUrlLabel')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>{t('org.sso.oidc.discoveryUrlDescription')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="scopes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('org.sso.oidc.scopesLabel')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>{t('org.sso.oidc.scopesDescription')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="attribute_mapping.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('org.sso.oidc.emailMappingLabel')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>{t('org.sso.oidc.emailMappingDescription')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="attribute_mapping.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('org.sso.oidc.nameMappingLabel')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>{t('org.sso.oidc.nameMappingDescription')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="attribute_mapping.role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('org.sso.oidc.roleMappingLabel')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>{t('org.sso.oidc.roleMappingDescription')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? t('common.saving') : t('org.sso.saveConfigButton')}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="metadata">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{t('org.sso.spMetadataTitle')}</h3>
                <p className="text-sm text-muted-foreground">{t('org.sso.spMetadataDescription')}</p>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium">
                      {t('org.sso.spEntityIdLabel')}
                    </label>
                    <CopyButton value={spEntityId} />
                  </div>
                  <Input value={spEntityId} readOnly />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium">
                      {t('org.sso.spMetadataUrlLabel')}
                    </label>
                    <CopyButton value={metadataUrl} />
                  </div>
                  <Input value={metadataUrl} readOnly />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium">
                      {t('org.sso.spMetadataXmlLabel')}
                    </label>
                    <CopyButton value={spMetadata} />
                  </div>
                  <Textarea 
                    value={spMetadata} 
                    readOnly 
                    rows={10} 
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>

      <CardFooter className="border-t pt-4">
        <p className="text-sm text-muted-foreground">
          {idpType === 'saml' 
            ? t('org.sso.samlConfigFooter') 
            : t('org.sso.oidcConfigFooter')}
        </p>
      </CardFooter>
    </Card>
  );
};

export default IDPConfiguration; 