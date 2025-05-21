'use client';

import { useAuthStore } from '@/lib/stores/auth.store';

export interface SessionTimeoutProps {
  isOpen: boolean;
  onClose: () => void;
  render: (props: { handleLogout: () => void; isOpen: boolean; onClose: () => void }) => React.ReactNode;
}

export function SessionTimeout({ isOpen, onClose, render }: SessionTimeoutProps) {
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    logout();
    onClose();
  };

  return <>{render({ handleLogout, isOpen, onClose })}</>;
}
