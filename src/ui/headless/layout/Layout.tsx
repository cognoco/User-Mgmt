import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme/theme-provider';

export interface LayoutProps {
  children: (props: { ThemeProvider: typeof ThemeProvider; Toaster: typeof Toaster }) => React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return <>{children({ ThemeProvider, Toaster })}</>;
}
