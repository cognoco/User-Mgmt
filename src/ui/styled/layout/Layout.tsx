import { Outlet } from "react-router-dom";
import { Layout as HeadlessLayout } from "@/src/ui/headless/layout/Layout"44;

export function Layout() {
  return (
    <HeadlessLayout>
      {({ ThemeProvider, Toaster }) => (
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
      )}
    </HeadlessLayout>
  );
}
