import { Toaster } from '@/ui/primitives/toaster';
import { ThemeProvider } from '@/ui/primitives/themeProvider';

export interface LayoutProps {
  children: (props: { ThemeProvider: typeof ThemeProvider; Toaster: typeof Toaster }) => React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return <>{children({ ThemeProvider, Toaster })}</>;
}
