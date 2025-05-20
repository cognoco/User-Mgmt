// import '@/lib/i18n';
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Import the new global CSS file
import { UserManagementClientBoundary } from "@/lib/auth/UserManagementClientBoundary"; // Import the new boundary component

const inter = Inter({ subsets: ["latin"] });

// Define viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#111111' },
  ],
};

// TODO: Add proper metadata
export const metadata: Metadata = {
  title: "User Management",
  description: "User Management Module",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'User Management',
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
    date: true,
    url: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className={inter.className}>
        <UserManagementClientBoundary>
          {children}
        </UserManagementClientBoundary>
      </body>
    </html>
  );
} 