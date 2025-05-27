// import '@/lib/i18n';
import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppInitializer } from '@/core/config/AppInitializer';
import { UserManagementClientBoundary } from '@/lib/auth/UserManagementClientBoundary';
import { SkipLink } from '@/ui/styled/navigation/SkipLink';
import { KeyboardShortcutsDialog } from '@/ui/styled/common/KeyboardShortcutsDialog';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';


// Define viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover'
};

export const metadata: Metadata = {
  title: 'User Management',
  description: 'User Management Module',
  generator: 'Next.js',
  keywords: ['user management', 'authentication'],
  authors: [{ name: 'Your Company' }],
  openGraph: {
    type: 'website',
    siteName: 'User Management',
    title: 'User Management System',
    description: 'Advanced user management system',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'User Management',
    description: 'Advanced user management system',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  useKeyboardShortcuts([
    {
      keys: ['Shift', '?'],
      description: 'Show keyboard shortcuts',
      handler: () => setDialogOpen(true),
    },
  ]);
  return (
    <html lang="en" className="antialiased">
      <head />
      <body className="font-sans">
        <SkipLink />
        <AppInitializer>
          <UserManagementClientBoundary>
            {children}
            <KeyboardShortcutsDialog
              shortcuts={[{ keys: ['Shift', '?'], description: 'Show this help' }]}
              open={dialogOpen}
              onOpenChange={setDialogOpen}
            />
          </UserManagementClientBoundary>
        </AppInitializer>
      </body>
    </html>
  );
}
