import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/ui/primitives/alertDialog';
import { Input } from '@/ui/primitives/input';
import { Button } from '@/ui/primitives/button';
import {
  RemoveMemberDialog as RemoveMemberDialogHeadless
} from '@/ui/headless/team/RemoveMemberDialog';

interface RemoveMemberDialogProps {
  teamId: string;
  memberId: string;
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  onRemoved?: () => void;
}

export function RemoveMemberDialog({ teamId, memberId, isOpen, onOpenChange, onRemoved }: RemoveMemberDialogProps) {
  return (
    <RemoveMemberDialogHeadless
      teamId={teamId}
      memberId={memberId}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onRemoved={onRemoved}
    >
      {({
        confirmText,
        setConfirmText,
        confirm,
        cancel,
        isProcessing,
        isOpen: open
      }) => (
        <AlertDialog open={open} onOpenChange={onOpenChange ?? (() => {})}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p>Type <span className="font-mono font-bold">remove</span> to confirm:</p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type 'remove' here"
                  className="max-w-[200px]"
                />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isProcessing} onClick={cancel}>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={confirm}
                disabled={confirmText.toLowerCase() !== 'remove' || isProcessing}
              >
                {isProcessing ? 'Removing...' : 'Remove Member'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </RemoveMemberDialogHeadless>
  );
}