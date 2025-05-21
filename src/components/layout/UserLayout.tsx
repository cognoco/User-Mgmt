import { SessionPolicyEnforcer } from '@/ui/styled/session/SessionPolicyEnforcer';

<UserContext>
  <ThemeProvider>
    <Toaster />
    <AuthGuard>
      <SessionPolicyEnforcer>
        {/* Existing layout content */}
      </SessionPolicyEnforcer>
    </AuthGuard>
  </ThemeProvider>
</UserContext> 