/**
 * Headless Corporate Profile Section
 *
 * Provides form state and validation for managing corporate profile information.
 */

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Company, companySchema, UserType } from '@/types/user-type';
import { useUserManagement } from '@/lib/auth/UserManagementProvider';

export interface CorporateProfileSectionProps {
  userType: UserType;
  company?: Company;
  onUpdate: (company: Company) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  children: (props: {
    form: ReturnType<typeof useForm<Company>>;
    handleSubmit: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
    pendingVerification: boolean;
  }) => React.ReactNode;
}

export function CorporateProfileSection({
  userType,
  company,
  onUpdate,
  isLoading = false,
  error = null,
  children,
}: CorporateProfileSectionProps) {
  const { corporateUsers } = useUserManagement();
  const [pendingVerification, setPendingVerification] = useState(false);

  const form = useForm<Company>({
    resolver: zodResolver(companySchema as unknown as z.ZodType<Company>),
    defaultValues: company,
  });

  if (!corporateUsers.enabled || userType !== UserType.CORPORATE) {
    return null;
  }

  const handleSubmit = async () => {
    setPendingVerification(false);
    const values = form.getValues();
    try {
      await onUpdate(values);
      if (company && (values.vatId !== company.vatId || values.name !== company.name)) {
        setPendingVerification(true);
      }
    } catch (err) {
      // errors handled via error prop
    }
  };

  return <>{children({ form, handleSubmit: form.handleSubmit(handleSubmit), isLoading, error, pendingVerification })}</>;
}

export default CorporateProfileSection;

