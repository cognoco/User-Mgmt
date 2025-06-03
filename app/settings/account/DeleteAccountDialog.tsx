import React, { useState } from 'react';
import { useDeleteAccount } from '@/hooks/user/useDeleteAccount';
import { Button } from '@/ui/primitives/button';
import { Input } from '@/ui/primitives/input';
import { Label } from '@/ui/primitives/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/primitives/dialog';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/ui/primitives/alert';

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
}

const CONFIRMATION_TEXT = 'DELETE';

const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({ open, onClose }) => {
  const [confirmText, setConfirmText] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const { deleteAccount, isLoading, error } = useDeleteAccount();

  const isConfirmed = confirmText === CONFIRMATION_TEXT && mfaCode.length >= 6;

  const handleDeleteAccount = async () => {
    if (isConfirmed) {
      await deleteAccount({ mfaCode });
      if (!error) {
        onClose();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle asChild>
            <h2>Delete Account</h2>
          </DialogTitle>
          <DialogDescription>
            This action is permanent and cannot be undone. All your data will be deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirm-deletion">Confirm deletion</Label>
            <p className="text-sm text-muted-foreground">
              Please type "DELETE" to confirm you want to delete your account
            </p>
            <Input
              id="confirm-deletion"
              aria-label="Confirm deletion"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRMATION_TEXT}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mfa-code">MFA Code</Label>
            <p className="text-sm text-muted-foreground">
              Enter the code from your authenticator app
            </p>
            <Input
              id="mfa-code"
              aria-label="MFA code"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              placeholder="123456"
              disabled={isLoading}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            You can <a className="underline" href="/api/gdpr/export">download your data</a> before deletion. Your account will be permanently removed after a 7 day cooling-off period.
          </p>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteAccount}
            disabled={isLoading || !isConfirmed}
          >
            Delete Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountDialog; 