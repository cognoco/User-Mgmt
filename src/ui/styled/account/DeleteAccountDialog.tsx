import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DeleteAccountDialog as HeadlessDeleteAccountDialog } from '@/ui/headless/account/DeleteAccountDialog';

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
}

const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({ open, onClose }) => {

  return (
    <HeadlessDeleteAccountDialog
      open={open}
      onClose={onClose}
      render={({ 
        confirmText, 
        setConfirmText, 
        isConfirmed, 
        isLoading, 
        error, 
        handleDeleteAccount, 
        handleCancel,
        confirmationText
      }) => (
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
                <Alert variant="destructive" role="alert">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="confirm-deletion">
                  Confirm deletion
                </Label>
                <p className="text-sm text-muted-foreground">
                  Please type &quot;{confirmationText}&quot; to confirm you want to delete your account
                </p>
                <Input
                  id="confirm-deletion"
                  aria-label="Confirm deletion"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={confirmationText}
                  disabled={isLoading}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={handleCancel} 
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
      )}
    />
  );
};

export default DeleteAccountDialog;