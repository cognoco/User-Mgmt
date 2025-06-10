/**
 * Headless Account Deletion Component
 * 
 * This component handles the behavior of account deletion without any UI rendering.
 * It follows the headless UI pattern using render props to allow complete UI customization.
 */

import { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';

export interface AccountDeletionProps {
  /**
   * Render prop function that receives form state and handlers
   */
  render: (props: {
    isDialogOpen: boolean;
    setIsDialogOpen: (isOpen: boolean) => void;
    password: string;
    setPassword: (password: string) => void;
    confirmText: string;
    setConfirmText: (text: string) => void;
    confirmChecked: boolean;
    setConfirmChecked: (checked: boolean) => void;
    error: string | null;
    localError: string | null;
    isLoading: boolean;
    handleDeleteAccount: () => Promise<void>;
  }) => React.ReactNode;
}

export function AccountDeletion({ render }: AccountDeletionProps) {
  const { deleteAccount, isLoading, error } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      setLocalError(null);
      
      // Validate confirmation text
      if (confirmText !== 'DELETE') {
        setLocalError('Please type DELETE to confirm');
        return;
      }
      
      // Validate confirmation checkbox
      if (!confirmChecked) {
        setLocalError('Please confirm that you understand the consequences');
        return;
      }
      
      // Delete account
      await deleteAccount(password);
      
      // Close dialog
      setIsDialogOpen(false);
      
      // Reset form
      setPassword('');
      setConfirmText('');
      setConfirmChecked(false);
    } catch (error) {
      console.error('Error deleting account:', error);
      setLocalError(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };
  
  // Render the component using the render prop
  return render({
    isDialogOpen,
    setIsDialogOpen,
    password,
    setPassword,
    confirmText,
    setConfirmText,
    confirmChecked,
    setConfirmChecked,
    error,
    localError,
    isLoading,
    handleDeleteAccount
  });
}
