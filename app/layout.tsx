// import '@/lib/i18n';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppInitializer } from '@/core/config/app-initializer';
import { UserManagementClientBoundary } from '@/lib/auth/UserManagementClientBoundary';

const inter = Inter({ subsets: ['latin'] });

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
  return (
    <html lang="en" className="antialiased">
      <head />
      <body className={inter.className}>
        <AppInitializer>
          <UserManagementClientBoundary>
            {children}
          </UserManagementClientBoundary>
        </AppInitializer>
      </body>
    </html>
  );
}
