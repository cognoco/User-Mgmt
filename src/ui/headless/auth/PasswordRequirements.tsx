/**
 * Headless Password Requirements Component
 * 
 * This component handles the behavior of password requirements validation without any UI rendering.
 * It follows the headless UI pattern using render props to allow complete UI customization.
 */

import { useEffect, useState } from 'react';

export interface PasswordRequirement {
  id: string;
  label: string;
  validator: (password: string) => boolean;
  isMet: boolean;
}

export interface PasswordRequirementsProps {
  /**
   * The password to validate
   */
  password: string;
  
  /**
   * Custom password requirements (if not provided, default requirements are used)
   */
  customRequirements?: PasswordRequirement[];
  
  /**
   * Callback when all requirements are met
   */
  onRequirementsMet?: (allMet: boolean) => void;
  
  /**
   * Render prop function that receives requirements state
   */
  render: (props: {
    requirements: PasswordRequirement[];
    allRequirementsMet: boolean;
  }) => React.ReactNode;
}

// Default password requirements
const DEFAULT_REQUIREMENTS: Omit<PasswordRequirement, 'isMet'>[] = [
  {
    id: 'length',
    label: 'At least 8 characters long',
    validator: (password) => password.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'Contains at least one uppercase letter',
    validator: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'Contains at least one lowercase letter',
    validator: (password) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'Contains at least one number',
    validator: (password) => /[0-9]/.test(password),
  },
  {
    id: 'special',
    label: 'Contains at least one special character',
    validator: (password) => /[^A-Za-z0-9]/.test(password),
  },
];

export function PasswordRequirements({
  password,
  customRequirements,
  onRequirementsMet,
  render
}: PasswordRequirementsProps) {
  // Initialize requirements with isMet property
  const initializeRequirements = () => {
    const baseRequirements = customRequirements || DEFAULT_REQUIREMENTS;
    return baseRequirements.map(req => ({
      ...req,
      isMet: req.validator(password)
    }));
  };
  
  // Requirements state
  const [requirements, setRequirements] = useState<PasswordRequirement[]>(initializeRequirements);
  
  // Update requirements when password changes
  useEffect(() => {
    const updatedRequirements = requirements.map(req => ({
      ...req,
      isMet: req.validator(password)
    }));
    
    setRequirements(updatedRequirements);
  }, [password]);
  
  // Check if all requirements are met
  const allRequirementsMet = requirements.every(req => req.isMet);
  
  // Notify parent when requirements status changes
  useEffect(() => {
    onRequirementsMet?.(allRequirementsMet);
  }, [allRequirementsMet, onRequirementsMet]);
  
  // Render the component using the render prop
  return render({
    requirements,
    allRequirementsMet
  });
}

export default PasswordRequirements;
