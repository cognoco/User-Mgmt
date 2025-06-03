"use client";

import React from "react";
import { UserManagementClientBoundary } from "@/lib/auth/UserManagementClientBoundary";
import { SkipLink } from "@/ui/styled/navigation/SkipLink";
import { KeyboardShortcutsDialog } from "@/ui/styled/common/KeyboardShortcutsDialog";
import dynamic from "next/dynamic";
import { useGlobalError } from "@/lib/state/errorStore";
const GlobalErrorDisplay = dynamic(
  () => import("@/ui/styled/common/GlobalErrorDisplay"),
  { ssr: false },
);
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const error = useGlobalError();
  useKeyboardShortcuts({
    "shift+?": () => setDialogOpen(true),
  });
  return (
    <>
      <SkipLink />
      {/* AppInitializer removed: server-only initialization must not run in a client component */}
      <UserManagementClientBoundary>
        {children}
        {error && <GlobalErrorDisplay />}
        <KeyboardShortcutsDialog
          shortcuts={[{ keys: ["Shift", "?"], description: "Show this help" }]}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </UserManagementClientBoundary>
    </>
  );
}
