# Phase 3: Admin UI Integration Plan

This document captures the plan for integrating the newly developed domain-specific components into the admin pages.

## Scope

This phase focuses on three main areas:

1. **Audit Logs** – provide a paginated view of system audit logs with filtering and export functionality.
2. **GDPR Compliance** – allow administrators to process export and deletion requests and manage user consent.
3. **SSO Configuration** – manage available SSO providers and existing connections.

## Integration Steps

1. **Analyze Current Implementation**
   - Identify direct database calls within the existing admin pages.
   - Document the current UI structure and behaviors.

2. **Import New Hooks**
   - Use the domain hooks located under `src/hooks/` to replace direct API calls.

3. **Replace Database Logic**
   - Remove any direct access to adapters or data stores from the pages.
   - Interact with services through the provided hooks only.

4. **Add Headless Components**
   - Compose the UI using headless components from `src/ui/headless/`.
   - Provide custom rendering via render props when necessary.

5. **Style with Styled Components**
   - Apply the prebuilt styled components from `src/ui/styled/` to keep a consistent appearance across the module.

6. **Update Navigation**
   - Extend the admin sidebar with links to Audit Logs, GDPR Compliance and SSO Configuration pages.

7. **Test Integration**
   - Verify that the new pages function correctly with the hooks.
   - Ensure the UI matches existing patterns and that all features have sufficient test coverage.

## Implementation Approach

Work on the features incrementally:

- **Week 3 – Phase 3**
  1. Integrate and verify **Audit Logs**.
  2. Implement **GDPR Compliance** pages.
  3. Implement **SSO Configuration** pages.

