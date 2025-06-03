'use client';

import React, { useEffect } from 'react';
import { UserManagementClientBoundary } from '@/lib/auth/UserManagementClientBoundary';
import { SkipLink } from '@/ui/styled/navigation/SkipLink';
import { KeyboardShortcutsDialog } from '@/ui/styled/common/KeyboardShortcutsDialog';
import { GlobalErrorDisplay } from '@/ui/styled/common/GlobalErrorDisplay';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { initializeErrorSystem } from '@/lib/monitoring';

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  useKeyboardShortcuts({
    'shift+?': () => setDialogOpen(true),
  });
  useEffect(() => {
    initializeErrorSystem();
  }, []);
  return (
    <>
      <SkipLink />
      {/* AppInitializer removed: server-only initialization must not run in a client component */}
      <UserManagementClientBoundary>
        {children}
        <GlobalErrorDisplay />
        <KeyboardShortcutsDialog
          shortcuts={[{ keys: ['Shift', '?'], description: 'Show this help' }]}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </UserManagementClientBoundary>
    </>
  );
} 