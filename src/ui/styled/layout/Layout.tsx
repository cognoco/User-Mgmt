import { Outlet } from 'react-router-dom';
import { Toaster } from '@/ui/primitives/toaster';
import { ThemeProvider } from '@/ui/styled/theme/theme-provider';

export function Layout() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="user-mgmt-theme">
      <div className="min-h-screen bg-background font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
        <Toaster />
      </div>
    </ThemeProvider>
  );
} 