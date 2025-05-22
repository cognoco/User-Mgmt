import { SessionPolicyEnforcer } from '@/ui/styled/session/session-policy-enforcer';

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