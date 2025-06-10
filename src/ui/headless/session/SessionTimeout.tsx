'use client';

import { useAuth } from '@/hooks/auth/useAuth';

export interface SessionTimeoutProps {
  isOpen: boolean;
  onClose: () => void;
  render: (props: { handleLogout: () => void; isOpen: boolean; onClose: () => void }) => React.ReactNode;
}

export function SessionTimeout({ isOpen, onClose, render }: SessionTimeoutProps) {
  const logout = useAuth().logout;

  const handleLogout = () => {
    logout();
    onClose();
  };

  return <>{render({ handleLogout, isOpen, onClose })}</>;
}
