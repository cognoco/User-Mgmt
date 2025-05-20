Reusable Test Files by Architectural Layer
Core Layer Tests
[✅] lib/auth/__tests__/mfa/mfa.test.ts - Moved to core/auth/__tests__/
[✅] lib/auth/__tests__/session/business-policies.test.tsx - Moved to core/auth/__tests__/
[✅] middleware/__tests__/permissions.test.ts - Moved to core/permission/__tests__/
[❓] lib/rbac/__tests__/roles.test.ts - File not found in the source location
Adapter Layer Tests
[❓] lib/database/__tests__/supabase-auth.test.ts - File not found in the source location
[❓] lib/database/__tests__/supabase-profile.test.ts - File not found in the source location
[❓] lib/database/__tests__/supabase-team.test.ts - File not found in the source location
Service Layer Tests
[✅] lib/auth/__tests__/sso/business-sso.test.tsx - Moved to services/auth/__tests__/
[✅] lib/stores/__tests__/auth.store.test.ts - Moved to services/auth/__tests__/
[✅] lib/stores/__tests__/user.store.test.ts - Moved to services/user/__tests__/
[❓] lib/stores/__tests__/rbac.store.test.ts - File not found in the source location
[❓] lib/stores/__tests__/team.store.test.ts - File not found in the source location
Hook Layer Tests
[❓] hooks/__tests__/useAuth.test.ts - File not found in the source location
[❓] hooks/__tests__/useRegistration.test.ts - File not found in the source location
[❓] hooks/__tests__/usePasswordReset.test.ts - File not found in the source location
[❓] hooks/__tests__/useMFA.test.ts - File not found in the source location
[❓] hooks/__tests__/useUserProfile.test.ts - File not found in the source location
[❓] hooks/__tests__/useTeams.test.ts - File not found in the source location
[✅] hooks/__tests__/usePermission.test.tsx - Already in the right location
UI Layer Tests
Component tests from components/auth/__tests__/ can be moved to ui/headless/auth/tests/ or ui/styled/auth/tests/ based on their nature
Component tests from components/profile/__tests__/ can be moved to ui/headless/user/tests/ or ui/styled/user/tests/
Component tests from components/team/__tests__/ can be moved to ui/headless/team/tests/ or ui/styled/team/tests/
Global Mocks
The global mocks in src/tests/mocks/ should be organized as follows:

Database-related mocks:
- [✅] supabase.ts - Moved to src/adapters/__tests__/mocks/supabase.mock.ts

Service-related mocks (store mocks):
Auth store mocks:
- [✅] auth.store.mock.ts - Moved to src/services/auth/__tests__/mocks/
- [✅] 2fa.store.mock.ts - Moved to src/services/auth/__tests__/mocks/
- [✅] session.store.mock.ts - Moved to src/services/auth/__tests__/mocks/
- [✅] oauth.store.mock.ts - Moved to src/services/auth/__tests__/mocks/

User store mocks:
- [✅] user.store.mock.ts - Moved to src/services/user/__tests__/mocks/
- [✅] profile.store.mock.ts - Moved to src/services/user/__tests__/mocks/
- [✅] connected-accounts.store.mock.ts - Moved to src/services/user/__tests__/mocks/
- [✅] preferences.store.mock.ts - Moved to src/services/user/__tests__/mocks/
- [✅] companyProfileStore.mock.ts - Moved to src/services/user/__tests__/mocks/
- [✅] subscription.store.mock.ts - Moved to src/services/user/__tests__/mocks/

Permission store mocks:
- [✅] rbac.store.mock.ts - Moved to src/services/permission/__tests__/mocks/

General test utilities:
- [✅] browser.ts - Moved to src/tests/utils/browser-mock.ts
- [✅] debug-auth.tsx - Moved to src/tests/utils/debug-auth.tsx
- [✅] redis.tsx - Already exists at src/tests/utils/redis-mock.tsx
- [✅] accountSwitcherApi.mock.ts - Already exists at src/tests/utils/accountSwitcherApi-mock.ts
- [✅] supabase spies.ts - Already exists at src/tests/utils/supabase-spies.ts
- [✅] test-mocks.ts - Moved to src/tests/utils/test-mocks.ts

Migration Strategy
For each test file:

Analyze if it tests a component that has been migrated to the new architecture
If yes, update import paths to match the new architecture
Update mock implementations to use centralized mocks
Ensure tests follow the interface-based testing approach
Fix any broken assertions or setup code