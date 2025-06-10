/**
 * Headless TwoFactorStatus Component
 *
 * Displays the current two-factor authentication status and exposes
 * handlers for disabling 2FA and managing backup codes. Follows the
 * headless UI pattern using render props so host applications can
 * provide custom markup.
 */
import { useState } from 'react';
import { use2FAStore } from '@/lib/stores/2fa.store';

/** Props for the TwoFactorStatus component */
export interface TwoFactorStatusProps {
  /** Whether two-factor authentication is enabled */
  isEnabled: boolean;
  /** Timestamp of the last successful 2FA usage */
  lastUsed?: Date;
  /** External loading state */
  loading: boolean;
  /** External error object */
  error: Error | null;
  /** Called when the user confirms disabling 2FA */
  onDisable: () => Promise<void>;
  /** Render prop for custom UI */
  children: (props: TwoFactorStatusRenderProps) => React.ReactNode;
}

/** Render props returned by TwoFactorStatus */
export interface TwoFactorStatusRenderProps {
  isEnabled: boolean;
  lastUsed?: Date;
  loading: boolean;
  error?: string;
  handleDisable: () => Promise<void>;
  handleViewBackupCodes: () => Promise<void>;
  handleRegenerateBackupCodes: () => Promise<void>;
  disableButtonProps: React.ButtonHTMLAttributes<HTMLButtonElement>;
  viewBackupCodesButtonProps: React.ButtonHTMLAttributes<HTMLButtonElement>;
  regenerateBackupCodesButtonProps: React.ButtonHTMLAttributes<HTMLButtonElement>;
  backupCodes: string[] | null;
  showBackupCodes: boolean;
}

/**
 * Headless TwoFactorStatus component implementation.
 */
export function TwoFactorStatus({
  isEnabled,
  lastUsed,
  loading,
  error,
  onDisable,
  children
}: TwoFactorStatusProps) {
  const { generateBackupCodes } = use2FAStore();
  const [internalLoading, setInternalLoading] = useState(false);
  const [internalError, setInternalError] = useState<string | undefined>();
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const combinedLoading = loading || internalLoading;
  const combinedError = error?.message || internalError;

  const handleDisable = async () => {
    setInternalError(undefined);
    setInternalLoading(true);
    try {
      await onDisable();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disable';
      setInternalError(message);
    } finally {
      setInternalLoading(false);
    }
  };

  const loadCodes = async () => {
    try {
      const codes = await generateBackupCodes();
      setBackupCodes(codes);
      return codes;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load backup codes';
      setInternalError(message);
      return [];
    }
  };

  const handleViewBackupCodes = async () => {
    setInternalError(undefined);
    setInternalLoading(true);
    await loadCodes();
    setShowBackupCodes(true);
    setInternalLoading(false);
  };

  const handleRegenerateBackupCodes = async () => {
    setInternalError(undefined);
    setInternalLoading(true);
    await loadCodes();
    setShowBackupCodes(true);
    setInternalLoading(false);
  };

  const disableButtonProps = {
    onClick: handleDisable,
    disabled: combinedLoading,
    'aria-disabled': combinedLoading
  } as React.ButtonHTMLAttributes<HTMLButtonElement>;

  const viewBackupCodesButtonProps = {
    onClick: handleViewBackupCodes,
    disabled: combinedLoading,
    'aria-disabled': combinedLoading
  } as React.ButtonHTMLAttributes<HTMLButtonElement>;

  const regenerateBackupCodesButtonProps = {
    onClick: handleRegenerateBackupCodes,
    disabled: combinedLoading,
    'aria-disabled': combinedLoading
  } as React.ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <>
      {children({
        isEnabled,
        lastUsed,
        loading: combinedLoading,
        error: combinedError,
        handleDisable,
        handleViewBackupCodes,
        handleRegenerateBackupCodes,
        disableButtonProps,
        viewBackupCodesButtonProps,
        regenerateBackupCodesButtonProps,
        backupCodes,
        showBackupCodes
      })}
    </>
  );
}

export default TwoFactorStatus;
