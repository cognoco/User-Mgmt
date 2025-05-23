# UI Integration Task: [DOMAIN_NAME]

## Your Task
Integrate the [DOMAIN_NAME] components into the User Management Module following the new architecture patterns. This task focuses on replacing direct database calls with the new hooks layer and implementing UI pages using the existing headless/styled components.

## What You Need to Do

### 1. Verify Component Existence
**IMPORTANT: All components should already exist in the codebase**
- First check if the required hooks exist in `src/hooks/[domain]/`
- Verify headless components exist in `src/ui/headless/[domain]/`
- Verify styled components exist in `src/ui/styled/[domain]/`
- If any component is missing, create a minimal placeholder that follows the architecture pattern, but do NOT implement full functionality

### 2. Create or Update the Page Component

**For new pages:**
Create a new page component at `app/[SECTION]/[DOMAIN]/page.tsx` that:
- Uses the appropriate hooks from `src/hooks/[domain]/`
- Implements the UI using styled components from `src/ui/styled/[domain]/`
- Follows the architecture guidelines for separation of concerns

**For existing pages:**
- Identify direct database/API calls and replace them with hook methods
- Replace any custom UI logic with the appropriate headless components
- Update the UI to use the styled components while maintaining the current layout
- Preserve any existing functionality not covered by the new components
- **IMPORTANT**: Do not delete any existing functionality

### 3. Implementation Requirements
- Replace ALL direct database/API calls with hook methods
- Use ONLY the existing hooks and UI components - don't create new ones
- Follow the established UI patterns for consistency
- Ensure proper error handling and loading states
- Maintain responsive design for all screen sizes
- **IMPORTANT**: Implement and verify all import paths correctly
  - Hooks should be imported from `@/hooks/{domain}/use-{feature}`
  - Headless components from `@/ui/headless/{domain}/{Component}`
  - Styled components from `@/ui/styled/{domain}/{Component}`
  - Follow kebab-case for file imports, PascalCase for components
- If a component is missing, create only a minimal placeholder that follows the architecture pattern

### 4. Example Implementation

```tsx
// REPLACE THIS WITH YOUR ACTUAL IMPLEMENTATION
'use client';
import { use[DomainName] } from '@/hooks/[domain]/use-[domain-name]';
import { [Component]List } from '@/ui/styled/[domain]/[Component]List';
import { [Component]Form } from '@/ui/styled/[domain]/[Component]Form';

export default function [Domain]Page() {
  const {
    // Replace with actual properties from your hook
    items,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem
  } = use[DomainName]();
  
  return (
    <div className="container mx-auto py-8 space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold">[Domain] Management</h1>
      
      {/* Form Section */}
      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Create New [Item]</h2>
        <[Component]Form 
          onSubmit={createItem}
          loading={loading}
          error={error}
        />
      </div>
      
      {/* List Section */}
      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">[Items] List</h2>
        <[Component]List 
          items={items}
          loading={loading}
          error={error}
          onUpdate={updateItem}
          onDelete={deleteItem}
        />
      </div>
    </div>
  );
}
```

### 5. Update Navigation (if needed)
If your component requires a new navigation item:
- Add it to the appropriate navigation component
- Ensure it's only shown when the user has the correct permissions

### 6. Creating Placeholders (Only if needed)
If a required component is missing, create a minimal placeholder that:
- Follows the architecture pattern (interface-based, headless pattern, etc.)
- Has the correct file structure and naming conventions
- Includes basic props and types but minimal implementation
- Has clear TODO comments indicating it's a placeholder
- Does NOT implement full business logic or complex UI

Example placeholder for a missing component:
```tsx
// src/ui/headless/[domain]/MissingComponent.tsx
import React from 'react';

export interface MissingComponentProps {
  // Basic props only
  loading?: boolean;
  error?: Error | null;
  onAction?: () => void;
}

export const MissingComponent: React.FC<MissingComponentProps> = ({
  loading = false,
  error = null,
  onAction,
}) => {
  // TODO: This is a placeholder component that needs proper implementation
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      <button onClick={onAction} disabled={loading}>Action</button>
    </div>
  );
};
```

## Architecture Reminders
- UI components must NOT contain business logic
- Use hooks for ALL data fetching and mutations
- Headless components handle behavior, styled components handle appearance
- Follow the file structure guidelines exactly

## Required Documentation Review
Before starting implementation, review these documents:
1. [Architecture Guidelines](../Product%20documentation/Architecture%20Guidelines.md) - Comprehensive architecture principles
2. [Architecture Rules](../Product%20documentation/Architecture%20Rules.md) - Core architecture requirements
3. [File structure guidelines.md](../File%20structure%20guidelines.md) - File naming and organization rules
4. The domain-specific documentation in one of the functionality-features-phase documents

## Architecture Compliance Checks
Before completing your task, verify that your implementation:
- Maintains strict separation between UI and business logic
- Uses only interface-based dependencies
- Follows the headless pattern with render props
- Keeps all database code isolated in adapter implementations
- Makes all features toggleable through configuration

## Deliverable
A fully functional page component that integrates with the new architecture, using the existing hooks and UI components for [DOMAIN_NAME].

## Definition of Done
- Page renders correctly with all components
- All functionality works as expected with proper error handling
- Code follows architecture guidelines with proper separation of concerns
- Navigation is updated if needed
- No direct database access in UI components
