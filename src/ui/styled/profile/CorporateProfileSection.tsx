import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { UserType, Company } from '@/types/user-type';
import { useUserManagement } from '@/lib/auth/UserManagementProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { z } from 'zod';
import { CompanyLogoUpload } from './CompanyLogoUpload';
import { useState } from 'react';

interface CorporateProfileSectionProps {
  userType: UserType;
  company?: Company & { verificationStatus?: string; isAdmin?: boolean };
  onUpdate: (company: Company) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

const corporateFormSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  position: z.string().optional(),
  department: z.string().optional(),
  vatId: z.string().optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

type CorporateFormValues = z.infer<typeof corporateFormSchema>;

export function CorporateProfileSection({
  userType,
  company,
  onUpdate,
  isLoading = false,
  error = null,
}: CorporateProfileSectionProps) {
  const { t } = useTranslation();
  const { corporateUsers } = useUserManagement();
  const [editMode, setEditMode] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState(false);
  const isAdmin = company?.isAdmin ?? true; // Default to true if not provided

  // Move useForm above early returns to avoid conditional hook call
  const form = useForm<CorporateFormValues>({
    resolver: zodResolver(corporateFormSchema),
    defaultValues: {
      name: company?.name || '',
      industry: company?.industry || '',
      website: company?.website || '',
      position: company?.position || '',
      department: company?.department || '',
      vatId: company?.vatId || '',
      size: company?.size,
      address: company?.address || {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
    },
  });

  if (!corporateUsers.enabled || userType !== UserType.CORPORATE) {
    return null;
  }
  
  // Track original values for re-verification logic
  const originalVatId = company?.vatId;
  const originalName = company?.name;

  const onSubmit = async (data: CorporateFormValues) => {
    setSuccess(null);
    setPendingVerification(false);
    // Map form data before sending, ensuring address is object or undefined
    const updatePayload: Partial<Company> = {
      ...data,
      address: (data.address && Object.values(data.address).some(v => v)) 
                 ? data.address 
                 : undefined, 
      size: data.size || undefined, 
    };
    // If VAT ID or name changed, trigger re-verification
    if (data.vatId !== originalVatId || data.name !== originalName) {
      setPendingVerification(true);
    }
    try {
      await onUpdate(updatePayload as Company);
      setSuccess(t('profile.corporate.updateSuccess', 'Company profile updated successfully.'));
      setEditMode(false);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error calling onUpdate for corporate profile:', error);
      }
    }
  };
  
  // View mode: show fields as text, placeholders for missing fields, Edit button if admin
  if (!editMode) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('profile.corporate.title')}</CardTitle>
          <CardDescription>{t('profile.corporate.description')}</CardDescription>
        </CardHeader>
        {success && (
          <CardContent>
            <Alert variant="default" role="alert">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          </CardContent>
        )}
        {error && (
          <CardContent>
            <Alert variant="destructive" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        )}
        <CardContent className="flex flex-col items-center pt-0 pb-6">
          <h3 className="text-lg font-medium mb-4 self-start">{t('profile.corporate.companyLogo')}</h3>
          <CompanyLogoUpload />
          <Separator className="mt-6" />
        </CardContent>
        <CardContent className="space-y-6 pt-0">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('profile.corporate.companyDetails')}</h3>
            <div className="space-y-2">
              <Label>{t('profile.corporate.companyName')} *</Label>
              <div>{company?.name || <span className="text-muted-foreground">{t('profile.corporate.missing', 'Not set')}</span>}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('profile.corporate.industry')}</Label>
                <div>{company?.industry || <span className="text-muted-foreground">{t('profile.corporate.missing', 'Not set')}</span>}</div>
              </div>
              <div className="space-y-2">
                <Label>{t('profile.corporate.companySize')}</Label>
                <div>{company?.size || <span className="text-muted-foreground">{t('profile.corporate.missing', 'Not set')}</span>}</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('profile.corporate.website')}</Label>
              <div>{company?.website || <span className="text-muted-foreground">{t('profile.corporate.missing', 'Not set')}</span>}</div>
            </div>
            <div className="space-y-2">
              <Label>{t('profile.corporate.vatId')}</Label>
              <div>{company?.vatId || <span className="text-muted-foreground">{t('profile.corporate.missing', 'Not set')}</span>}</div>
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('profile.corporate.yourPosition')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('profile.corporate.position')}</Label>
                <div>{company?.position || <span className="text-muted-foreground">{t('profile.corporate.missing', 'Not set')}</span>}</div>
              </div>
              <div className="space-y-2">
                <Label>{t('profile.corporate.department')}</Label>
                <div>{company?.department || <span className="text-muted-foreground">{t('profile.corporate.missing', 'Not set')}</span>}</div>
              </div>
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('profile.corporate.companyAddress')}</h3>
            <div className="space-y-2">
              <Label>{t('profile.corporate.street')}</Label>
              <div>{company?.address?.street || <span className="text-muted-foreground">{t('profile.corporate.missing', 'Not set')}</span>}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('profile.corporate.city')}</Label>
                <div>{company?.address?.city || <span className="text-muted-foreground">{t('profile.corporate.missing', 'Not set')}</span>}</div>
              </div>
              <div className="space-y-2">
                <Label>{t('profile.corporate.state')}</Label>
                <div>{company?.address?.state || <span className="text-muted-foreground">{t('profile.corporate.missing', 'Not set')}</span>}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('profile.corporate.postalCode')}</Label>
                <div>{company?.address?.postalCode || <span className="text-muted-foreground">{t('profile.corporate.missing', 'Not set')}</span>}</div>
              </div>
              <div className="space-y-2">
                <Label>{t('profile.corporate.country')}</Label>
                <div>{company?.address?.country || <span className="text-muted-foreground">{t('profile.corporate.missing', 'Not set')}</span>}</div>
              </div>
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('profile.corporate.verificationStatus')}</h3>
            <div>{company?.verificationStatus || <span className="text-muted-foreground">{t('profile.corporate.verificationUnknown', 'Unknown')}</span>}</div>
            {pendingVerification && (
              <div className="text-warning text-sm mt-2">{t('profile.corporate.pendingVerification', 'Changes require re-verification.')}</div>
            )}
          </div>
        </CardContent>
        {isAdmin && (
          <CardFooter className="flex justify-end">
            <Button type="button" onClick={() => setEditMode(true)}>{t('common.edit', 'Edit')}</Button>
          </CardFooter>
        )}
      </Card>
    );
  }

  // Edit mode: show form as before, with Save/Cancel
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{t('profile.corporate.title')}</CardTitle>
        <CardDescription>{t('profile.corporate.description')}</CardDescription>
      </CardHeader>
      {success && (
        <CardContent>
          <Alert variant="default" role="alert">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        </CardContent>
      )}
      {error && (
        <CardContent>
          <Alert variant="destructive" role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      )}
      <CardContent className="flex flex-col items-center pt-0 pb-6">
        <h3 className="text-lg font-medium mb-4 self-start">{t('profile.corporate.companyLogo')}</h3>
        <CompanyLogoUpload />
        <Separator className="mt-6" />
      </CardContent>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6 pt-0">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('profile.corporate.companyDetails')}</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">{t('profile.corporate.companyName')} *</Label>
              <Input 
                id="name" 
                {...form.register('name')} 
              />
              {form.formState.errors.name && (
                <p className="text-destructive text-sm" role="alert">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">{t('profile.corporate.industry')}</Label>
                <Input 
                  id="industry" 
                  {...form.register('industry')} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">{t('profile.corporate.companySize')}</Label>
                <select
                  id="size"
                  className="w-full px-3 py-2 border rounded-md"
                  {...form.register('size')}
                >
                  <option value="">{t('profile.corporate.selectCompanySize')}</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="501-1000">501-1000</option>
                  <option value="1000+">1000+</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">{t('profile.corporate.website')}</Label>
              <Input 
                id="website" 
                placeholder="https://example.com" 
                {...form.register('website')} 
              />
              {form.formState.errors.website && (
                <p className="text-destructive text-sm" role="alert">{form.formState.errors.website.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vatId">{t('profile.corporate.vatId')}</Label>
              <Input 
                id="vatId" 
                {...form.register('vatId')} 
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('profile.corporate.yourPosition')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">{t('profile.corporate.position')}</Label>
                <Input 
                  id="position" 
                  {...form.register('position')} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">{t('profile.corporate.department')}</Label>
                <Input 
                  id="department" 
                  {...form.register('department')} 
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('profile.corporate.companyAddress')}</h3>
            
            <div className="space-y-2">
              <Label htmlFor="street">{t('profile.corporate.street')}</Label>
              <Input 
                id="street" 
                {...form.register('address.street')} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{t('profile.corporate.city')}</Label>
                <Input 
                  id="city" 
                  {...form.register('address.city')} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">{t('profile.corporate.state')}</Label>
                <Input 
                  id="state" 
                  {...form.register('address.state')} 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">{t('profile.corporate.postalCode')}</Label>
                <Input 
                  id="postalCode" 
                  {...form.register('address.postalCode')} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">{t('profile.corporate.country')}</Label>
                <Input 
                  id="country" 
                  {...form.register('address.country')} 
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => { setEditMode(false); setSuccess(null); form.reset(); }} disabled={isLoading}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('common.saving') : t('common.save')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 