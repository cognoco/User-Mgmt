import { SessionPolicyEnforcer } from '@/components/session/SessionPolicyEnforcer';

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