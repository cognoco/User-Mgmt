import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the context shape
interface OrganizationContextType {
  orgId: string | null;
  organization: any | null; // Replace 'any' with your Organization type
  isLoading: boolean;
  error: Error | null;
}

// Create the context
const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

// Define the provider props
interface OrganizationProviderProps {
  children: ReactNode;
  orgId: string; // Assuming orgId is passed to provider
}

/**
 * OrganizationProvider Component
 * Placeholder for managing organization context.
 */
export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({ children, orgId }) => {
  const [organization, setOrganization] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate fetching organization data based on orgId
    setIsLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      if (orgId === 'org-123') { // Mock data for a specific ID used in tests
        setOrganization({
          id: 'org-123',
          name: 'Acme Inc',
          domain: 'acme.com',
          sso_enabled: true,
          sso_provider: 'azure',
          sso_domain_required: true
        });
      } else {
        // setError(new Error('Organization not found'));
        setOrganization(null); // Or handle not found case
      }
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [orgId]);

  const value = { orgId, organization, isLoading, error };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

// Custom hook to use the context
export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

export default OrganizationProvider; 