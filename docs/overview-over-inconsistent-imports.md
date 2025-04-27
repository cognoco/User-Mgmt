# Overview of Inconsistent Imports

This document summarizes modules in the codebase that are imported using both alias and relative paths, which can lead to maintenance issues and confusion. Standardizing import paths is recommended for consistency and reliability.

| Module/Type         | Alias Import Example                        | Relative Import Example(s)                |
|---------------------|---------------------------------------------|-------------------------------------------|
| UI Components       | `@/components/ui/button`                    | `../ui/button`, `../../components/ui/button` |
| Hooks/Stores        | `@/lib/stores/auth.store`                   | `../../lib/stores/auth.store`             |
| Supabase Client     | `@/lib/database/supabase`                   | `../../lib/supabase`                      |
| Types               | `@/types/user-type`                         | `../types/user-type`                      |
| DataTable           | `@/components/common/DataTable`             | `../common/DataTable`                     |
| InviteMemberForm    | `@/components/team/InviteMemberForm`        | `../InviteMemberForm`                     |

## Recommendation

- **Choose a standard** (preferably alias imports for maintainability and refactorability).
- **Update all imports** to use the chosen style for each module across the codebase.
- **Enforce with ESLint**: Use `eslint-plugin-import` with rules like `no-restricted-imports` or `no-relative-parent-imports` to prevent future inconsistencies.

---

This table should be updated as inconsistencies are resolved or new ones are found.
