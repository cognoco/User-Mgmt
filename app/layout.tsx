import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Import the new global CSS file
import { UserManagementClientBoundary } from "@/lib/auth/UserManagementClientBoundary"; // Import the new boundary component

const inter = Inter({ subsets: ["latin"] });

// TODO: Add proper metadata
export const metadata: Metadata = {
  title: "User Management",
  description: "User Management Module",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserManagementClientBoundary>
          {children}
        </UserManagementClientBoundary>
      </body>
    </html>
  );
} 