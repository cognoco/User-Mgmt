'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth/useAuth';

interface SessionTimeoutProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SessionTimeout({ isOpen, onClose }: SessionTimeoutProps) {
  const logout = useAuth().logout;

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session Expired</DialogTitle>
        </DialogHeader>
        <p className="py-4">Your session has expired due to inactivity. Please log in again.</p>
        <DialogFooter>
          <Button onClick={handleLogout}>Log In Again</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
