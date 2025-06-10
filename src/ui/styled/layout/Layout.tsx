import { Layout as HeadlessLayout } from "@/ui/headless/layout/Layout";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <HeadlessLayout>
      {({ ThemeProvider, Toaster }) => (
        <ThemeProvider defaultTheme="system" storageKey="user-mgmt-theme">
          <div className="min-h-screen bg-background font-sans antialiased">
            <div className="relative flex min-h-screen flex-col">
              <div className="flex-1">
                {children}
              </div>
            </div>
            <Toaster />
          </div>
        </ThemeProvider>
      )}
    </HeadlessLayout>
  );
}
