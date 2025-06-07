import { Outlet } from "react-router-dom";
import { UserLayout as HeadlessUserLayout } from "@/ui/headless/layout/UserLayout";

export function UserLayout() {
  return (
    <HeadlessUserLayout>
      {({ SessionPolicyEnforcer }) => (
        <SessionPolicyEnforcer>
          <Outlet />
        </SessionPolicyEnforcer>
      )}
    </HeadlessUserLayout>
  );
}
