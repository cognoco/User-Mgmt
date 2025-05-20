# User Management Module: Architecture Rules

## Core Architecture Rules

1. **Modular & Pluggable Design is NON-NEGOTIABLE**
   - The module MUST function as a standalone block
   - The module MUST be integrable into any web/mobile application
   - All non-core features MUST be easy to enable/disable

2. **Database Agnosticism is REQUIRED**
   - No direct database calls in business logic or UI
   - All database access MUST go through adapter interfaces
   - Supabase code MUST be isolated in adapter implementations

3. **Strict Separation of Code Responsibilities**
   - UI components MUST NOT contain business logic
   - Business logic MUST NOT render UI elements
   - Services MUST be interface-based and replaceable

4. **UI Components MUST Follow These Rules:**
   - Every component MUST have a headless version (behavior only)
   - Every component MUST use render props or children functions
   - Every component MUST be replaceable by host applications
   - Every component MUST work if host replaces the UI
   - CSS/styling MUST be contained and overridable

5. **Business Logic and Services MUST Follow These Rules:**
   - All logic MUST reside in dedicated service classes/functions
   - All services MUST be interface-based
   - All services MUST be replaceable via configuration
   - All services MUST have default implementations
   - All services MUST be testable in isolation

## Red Flags That Indicate Violations

- UI component making API/database calls directly
- Business logic containing UI rendering code
- Hard-coded dependencies between components
- Components that can't be replaced or customized
- UI that breaks when underlying implementation changes
- Services with UI-specific code
- Code that assumes specific UI libraries or styling approaches
- Features that can't be disabled independently

## Enforcement Checklist

Before merging any code:

1. Are UI components limited to display and user interaction only?
2. Are all API calls and data processing in services?
3. Can host applications replace UI components with their own?
4. Can host applications replace service implementations?
5. Are all dependencies properly injected and configurable?
6. Can features be enabled/disabled individually?
7. Does the code follow the layered architecture pattern?

The success metric for our architecture is simple: A host application should be able to use our functionality while replacing ANY part of our implementation, from UI to database.
