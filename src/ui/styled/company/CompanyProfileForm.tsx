import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Textarea } from '@/ui/primitives/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/primitives/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/primitives/select';
import { useToast } from '@/lib/hooks/use-toast';
import { CompanyLogoUpload } from '@/ui/styled/profile/CompanyLogoUpload';
import { CheckCircle, XCircle, Loader2, Search, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api/axios';

// Company Profile Schema
const companyProfileSchema = z.object({
  name: z.string().min(2, {
    message: 'Company name must be at least 2 characters',
  }).max(100, {
    message: 'Company name must be less than 100 characters',
  }),
  legal_name: z.string().min(2, {
    message: 'Legal name must be at least 2 characters',
  }).max(100, {
    message: 'Legal name must be less than 100 characters',
  }),
  registration_number: z.string().optional(),
  tax_id: z.string().optional(),
  website: z.string().url({
    message: 'Please enter a valid URL',
  }).optional(),
  industry: z.string().min(2, {
    message: 'Please select an industry',
  }).max(50),
  size_range: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']),
  founded_year: z.number().int().min(1800).max(new Date().getFullYear()),
  description: z.string().max(1000, {
    message: 'Description must be less than 1000 characters',
  }).optional(),
  address: z.object({
    street_line1: z.string().min(1, { message: 'Street address is required' }),
    street_line2: z.string().optional(),
    city: z.string().min(1, { message: 'City is required' }),
    state: z.string().optional(),
    postal_code: z.string().min(1, { message: 'Postal code is required' }),
    country: z.string().min(1, { message: 'Country is required' }),
    validated: z.boolean().optional(),
  }).superRefine((data, ctx) => {
    if (data.country) {
      const countryTerms = ADDRESS_TERMS_BY_COUNTRY[data.country] || ADDRESS_TERMS_BY_COUNTRY.DEFAULT;
      if (countryTerms.stateRequired && (!data.state || data.state.trim() === '')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${countryTerms.stateLabel} is required.`,
          path: ['state'],
        });
      }
    }
  }).optional(),
});

type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;

const INDUSTRY_OPTIONS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Services',
  'Other',
];

const SIZE_RANGES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
];

// Add a list of countries (can be moved to constants later)
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'SG', name: 'Singapore' },
  { code: 'KR', name: 'South Korea' },
  // Add more countries as needed or replace with a library later
];

// New: Configuration for dynamic address field labels and requirements
const ADDRESS_TERMS_BY_COUNTRY: Record<string, { stateLabel: string; postalCodeLabel: string; stateRequired?: boolean }> = {
  US: { stateLabel: 'State', postalCodeLabel: 'ZIP Code', stateRequired: true },
  CA: { stateLabel: 'Province', postalCodeLabel: 'Postal Code', stateRequired: true },
  GB: { stateLabel: 'County', postalCodeLabel: 'Postcode', stateRequired: false },
  AU: { stateLabel: 'State / Territory', postalCodeLabel: 'Postcode', stateRequired: true },
  DE: { stateLabel: 'State (Bundesland)', postalCodeLabel: 'Postal Code (PLZ)', stateRequired: true },
  FR: { stateLabel: 'Region', postalCodeLabel: 'Postal Code (Code Postal)', stateRequired: false }, // Departments are more common for addresses, but Region is an admin area.
  JP: { stateLabel: 'Prefecture', postalCodeLabel: 'Postal Code (郵便番号)', stateRequired: true },
  // Add more as needed
  DEFAULT: { stateLabel: 'State / Province / Region', postalCodeLabel: 'Postal Code', stateRequired: false },
};

interface ValidationStatus {
  status: 'idle' | 'loading' | 'valid' | 'invalid' | 'error';
  message?: string;
}

interface CompanyLookupStatus {
  status: 'idle' | 'loading' | 'found' | 'not_found' | 'error';
  message?: string;
}

// Add type for validation status
type AddressValidationStatus = 'idle' | 'loading' | 'valid' | 'invalid' | 'error';

interface CompanyProfileFormProps {
  initialData?: Partial<CompanyProfileFormData>;
  onSubmit: (data: CompanyProfileFormData) => Promise<void>;
  isLoading?: boolean;
}

export function CompanyProfileForm({
  initialData,
  onSubmit,
  isLoading = false,
}: CompanyProfileFormProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [regNumValidation, setRegNumValidation] = useState<ValidationStatus>({ status: 'idle' });
  const [taxIdValidation, setTaxIdValidation] = useState<ValidationStatus>({ status: 'idle' });
  const [companyLookup, setCompanyLookup] = useState<CompanyLookupStatus>({ status: 'idle' });

  // Add state for address validation
  const [addressValidationStatus, setAddressValidationStatus] = useState<AddressValidationStatus>('idle');
  const [addressValidationError, setAddressValidationError] = useState<string | null>(null);
  const [addressValidatedSuccessfully, setAddressValidatedSuccessfully] = useState(false);

  const form = useForm<CompanyProfileFormData>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      name: initialData?.name || '',
      legal_name: initialData?.legal_name || '',
      registration_number: initialData?.registration_number || '',
      tax_id: initialData?.tax_id || '',
      website: initialData?.website || '',
      industry: initialData?.industry || '',
      size_range: initialData?.size_range || '1-10',
      founded_year: initialData?.founded_year || new Date().getFullYear(),
      description: initialData?.description || '',
      address: {
        street_line1: initialData?.address?.street_line1 || '',
        street_line2: initialData?.address?.street_line2 || '',
        city: initialData?.address?.city || '',
        state: initialData?.address?.state || '',
        postal_code: initialData?.address?.postal_code || '',
        country: initialData?.address?.country || '',
        validated: initialData?.address?.validated || false,
      },
    },
    mode: 'onChange',
  });

  // Effect to reset validation status if address changes
  const addressWatch = form.watch(['address.street_line1', 'address.street_line2', 'address.city', 'address.state', 'address.postal_code', 'address.country']);
  useEffect(() => {
    setAddressValidationStatus('idle');
    setAddressValidationError(null);
    setAddressValidatedSuccessfully(false);
  }, [addressWatch]);

  const handleRegistrationNumberValidation = async () => {
    const regNum = form.getValues('registration_number');
    const countryCode = form.getValues('address.country');

    if (!regNum) {
      setRegNumValidation({ status: 'error', message: 'Please enter a registration number first.' });
      return;
    }
    if (!countryCode) {
      setRegNumValidation({ status: 'error', message: 'Please select a country in the address section first.' });
      return;
    }

    setRegNumValidation({ status: 'loading' });
    try {
      const response = await api.post('/api/company/validate/registration', {
        registrationNumber: regNum,
        countryCode: countryCode,
      });
      setRegNumValidation({ status: response.data.status || 'valid', message: response.data.message });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Validation failed.';
      const status = error.response?.data?.status || (error.response?.status === 404 ? 'invalid' : 'error');
      setRegNumValidation({ status: status, message });
    }
  };

  const handleTaxIdValidation = async () => {
    const taxId = form.getValues('tax_id');
    const countryCode = form.getValues('address.country');

    if (!taxId) {
      setTaxIdValidation({ status: 'error', message: 'Please enter a Tax ID first.' });
      return;
    }
    if (!countryCode) {
      setTaxIdValidation({ status: 'error', message: 'Please select a country in the address section first.' });
      return;
    }

    setTaxIdValidation({ status: 'loading' });
    try {
      const response = await api.post('/api/company/validate/tax', {
        taxId: taxId,
        countryCode: countryCode,
      });
      setTaxIdValidation({ status: response.data.status || 'valid', message: response.data.message });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Tax ID validation failed.';
      const status = error.response?.data?.status || (error.response?.status === 404 ? 'invalid' : 'error');
      setTaxIdValidation({ status: status, message });
    }
  };

  const handleCompanyLookup = async () => {
    const regNum = form.getValues('registration_number');
    const companyName = form.getValues('name');
    const query = regNum || companyName;

    if (!query) {
      setCompanyLookup({ status: 'error', message: 'Please enter a Company Name or Registration Number first.' });
      return;
    }

    setCompanyLookup({ status: 'loading' });
    try {
      const response = await api.post('/api/registry/lookup', {
        query: query,
      });

      if (response.data.status === 'found') {
        setCompanyLookup({ status: 'found', message: response.data.message });
        const companyData = response.data.company;
        form.reset({
          ...form.getValues(),
          name: companyData.name || form.getValues('name'),
          legal_name: companyData.legal_name || form.getValues('legal_name'),
          registration_number: companyData.registration_number || form.getValues('registration_number'),
          tax_id: companyData.tax_id || form.getValues('tax_id'),
          website: companyData.website || form.getValues('website'),
          industry: companyData.industry || form.getValues('industry'),
          size_range: companyData.size_range || form.getValues('size_range'),
          founded_year: companyData.founded_year || form.getValues('founded_year'),
          description: companyData.description || form.getValues('description'),
        });
        setRegNumValidation({ status: 'idle' });
        setTaxIdValidation({ status: 'idle' });
        toast({ title: 'Company Found', description: 'Form fields populated with mock data.' });
      } else {
        setCompanyLookup({ status: 'not_found', message: response.data.message });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Company lookup failed.';
      if (error.response?.status === 404) {
        setCompanyLookup({ status: 'not_found', message });
      } else {
        setCompanyLookup({ status: 'error', message });
      }
    }
  };

  // --- Address Validation Handler ---
  const handleAddressValidation = async () => {
    setAddressValidationStatus('loading');
    setAddressValidationError(null);
    setAddressValidatedSuccessfully(false);

    const addressData = form.getValues('address');

    if (!addressData?.country || !addressData?.street_line1 || !addressData?.city || !addressData?.postal_code) {
        setAddressValidationError('Please fill in required address fields (Street, City, Postal Code, Country) before validating.');
        setAddressValidationStatus('error');
        toast({ title: 'Missing Information', description: 'Please fill in all required address fields before validating.', variant: 'default' });
        return;
    }

    // Prepare payload for our backend endpoint
    const payload = {
        addressLines: [addressData.street_line1, addressData.street_line2].filter(Boolean) as string[],
        regionCode: addressData.country,
        locality: addressData.city,
        administrativeArea: addressData.state,
        postalCode: addressData.postal_code,
    };

    try {
        const response = await api.post('/api/address/validate', payload);
        const { isValid } = response.data;

        if (isValid) {
            setAddressValidationStatus('valid');
            setAddressValidatedSuccessfully(true);
            form.setValue('address.validated', true, { shouldValidate: true });
            if (response.data.validatedAddress) {
                const currentAddr = form.getValues('address');
                const newAddr = response.data.validatedAddress;
                if (currentAddr) {
                  form.setValue('address', { 
                      ...currentAddr, 
                      street_line1: newAddr.street_line1 || currentAddr.street_line1,
                      street_line2: newAddr.street_line2 || currentAddr.street_line2,
                      city: newAddr.city || currentAddr.city,
                      state: newAddr.state || currentAddr.state,
                      postal_code: newAddr.postal_code || currentAddr.postal_code,
                      country: newAddr.country || currentAddr.country,
                      validated: true 
                  }, { shouldValidate: true });
                  toast({ title: 'Address Validated', description: response.data.message || 'Address details confirmed and updated.'});
                } else {
                  form.setValue('address', { ...newAddr, validated: true }, { shouldValidate: true });
                  toast({ title: 'Address Validated', description: response.data.message || 'Address details populated.'});
                }
            } else {
                toast({ title: 'Address Validated', description: response.data.message || 'Address details confirmed.'});
            }
        } else if (response.data.status === 'needs_correction' || response.data.status === 'invalid') {
            setAddressValidationStatus(response.data.status);
            setAddressValidationError(response.data.message || 'Address requires correction or is invalid.');
            form.setValue('address.validated', false, { shouldValidate: true });
            toast({ title: 'Address Validation Issue', description: response.data.message || 'Address requires correction.', variant: 'default' });
        }
    } catch (error: any) {
        const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to validate address.';
        setAddressValidationError(errMsg);
        setAddressValidationStatus('error');
        toast({ title: 'Validation Error', description: errMsg, variant: 'destructive' });
    }
  };
  // --- End Address Validation Handler ---

  const onFormSubmit = async (data: CompanyProfileFormData) => {
    try {
      setIsSaving(true);
      // Add validated flag if address was successfully validated
      let submitData = { ...data }; 
      if (submitData.address && addressValidatedSuccessfully) {
          submitData = { 
              ...submitData, 
              address: { ...submitData.address, validated: true }
          };
      }
      
      // Before submitting, ensure state is emptied if not required for the country and not provided
      if (submitData.address && submitData.address.country) {
        const countryTerms = ADDRESS_TERMS_BY_COUNTRY[submitData.address.country] || ADDRESS_TERMS_BY_COUNTRY.DEFAULT;
        if (!countryTerms.stateRequired && !submitData.address.state) {
          submitData.address.state = ''; // Set to empty string if not required and not provided, to avoid issues with optional empty strings vs undefined.
        }
      }

      await onSubmit(submitData); // Pass potentially modified data
      toast({
        title: 'Success',
        description: 'Company profile has been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save company profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Watch selected country to update labels
  const selectedCountry = form.watch('address.country');
  const currentAddressTerms = ADDRESS_TERMS_BY_COUNTRY[selectedCountry || ''] || ADDRESS_TERMS_BY_COUNTRY.DEFAULT;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-8">
        <div className="mb-8">
          <FormLabel>Company Logo</FormLabel>
          <div className="mt-2">
            <CompanyLogoUpload />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="legal_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Legal Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter legal name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registration_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration Number</FormLabel>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Input placeholder="Enter registration number" {...field} />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRegistrationNumberValidation}
                    disabled={regNumValidation.status === 'loading' || !field.value || companyLookup.status === 'loading'}
                    title="Verify Registration Number"
                  >
                    {regNumValidation.status === 'loading' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleCompanyLookup}
                    disabled={companyLookup.status === 'loading' || (!form.getValues('registration_number') && !form.getValues('name'))}
                    title="Lookup Company Details (using Reg# or Name)"
                  >
                    {companyLookup.status === 'loading' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {regNumValidation.status !== 'idle' && regNumValidation.status !== 'loading' && (
                   <FormDescription className={`flex items-center space-x-1 ${ 
                       regNumValidation.status === 'valid' ? 'text-green-600' : 'text-destructive'
                    }`}>
                       {regNumValidation.status === 'valid' && <CheckCircle className="h-4 w-4" />}
                       {regNumValidation.status === 'invalid' && <XCircle className="h-4 w-4" />}
                       {regNumValidation.status === 'error' && <XCircle className="h-4 w-4" />}
                       <span>{regNumValidation.message}</span>
                   </FormDescription>
                )}
                {companyLookup.status !== 'idle' && companyLookup.status !== 'loading' && (
                     <FormDescription className={`flex items-center space-x-1 mt-1 ${ 
                         companyLookup.status === 'found' ? 'text-blue-600' : 'text-destructive'
                      }`}>
                         {companyLookup.status === 'found' && <Search className="h-4 w-4" />}
                         {(companyLookup.status === 'not_found' || companyLookup.status === 'error') && <XCircle className="h-4 w-4" />}
                         <span>{companyLookup.message}</span>
                     </FormDescription>
                 )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tax_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax ID</FormLabel>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Input placeholder="Enter tax ID" {...field} />
                  </FormControl>
                   <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTaxIdValidation}
                    disabled={taxIdValidation.status === 'loading' || !field.value}
                  >
                    {taxIdValidation.status === 'loading' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Verify'
                    )}
                  </Button>
                </div>
                 {taxIdValidation.status !== 'idle' && taxIdValidation.status !== 'loading' && (
                   <FormDescription className={`flex items-center space-x-1 ${ 
                       taxIdValidation.status === 'valid' ? 'text-green-600' : 'text-destructive'
                    }`}>
                       {taxIdValidation.status === 'valid' && <CheckCircle className="h-4 w-4" />}
                       {taxIdValidation.status === 'invalid' && <XCircle className="h-4 w-4" />}
                       {taxIdValidation.status === 'error' && <XCircle className="h-4 w-4" />}
                       <span>{taxIdValidation.message}</span>
                   </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="https://example.com" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="industry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="size_range"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Size</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SIZE_RANGES.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size} employees
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="founded_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Founded Year</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1800}
                    max={new Date().getFullYear()}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || '')}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter company description" 
                  className="h-32"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-6 mt-8">
          <h3 className="text-lg font-medium">Company Address (Primary)</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="address.street_line1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.street_line2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address Line 2 (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Suite 400" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., San Francisco" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {currentAddressTerms.stateLabel}
                    {currentAddressTerms.stateRequired && <span className="text-destructive"> *</span>}
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {currentAddressTerms.postalCodeLabel}
                    <span className="text-destructive"> *</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 94107" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Map over the COUNTRIES array */}
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                      {/* Remove placeholder items */}
                      {/* 
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="placeholder">Other (Add countries)</SelectItem> 
                      */}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Validation Button & Status */}
          <div className="flex items-center space-x-2 mt-4">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleAddressValidation}
              disabled={
                addressValidationStatus === 'loading' || 
                !form.getValues('address.street_line1') || 
                !form.getValues('address.city') || 
                !form.getValues('address.postal_code') || 
                !form.getValues('address.country')
              }
              data-testid="validate-address-button"
              className="mt-2"
            >
              {addressValidationStatus === 'loading' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Validate Address
            </Button>
            {addressValidationStatus !== 'idle' && addressValidationStatus !== 'loading' && (
              <div className={`mt-2 text-sm flex items-center ${addressValidatedSuccessfully ? 'text-green-600' : 'text-destructive'}`}>
                {addressValidatedSuccessfully ? 
                  <CheckCircle className="mr-2 h-4 w-4" /> : 
                  <XCircle className="mr-2 h-4 w-4" />
                }
                {addressValidationError || (addressValidatedSuccessfully ? (form.getValues('address.validated') ? 'Address successfully validated.' : 'Address appears valid.') : 'Address validation issue.')}
              </div>
            )}
          </div>
          {/* TODO: Display suggestions if addressSuggestions is not null */}

        </div>
        {/* Address Section End */}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isLoading || isSaving}
          >
            Reset
          </Button>
          <Button 
            type="submit"
            disabled={isLoading || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 