# UI Integration Task: [DOMAIN_NAME]

## Your Task
**PRIMARY FOCUS: Update import paths and integrate the new architecture components**

Your main responsibility is to update the existing pages to use the new architecture components for [DOMAIN_NAME]. This means:
1. Replacing direct database/API calls with the new hooks
2. Updating import paths to use the new component locations
3. Integrating the existing headless/styled components into the UI

This task is primarily about integration, not creating new components from scratch.

## What You Need to Do

### 1. Search Thoroughly for Existing Components
**IMPORTANT: Search the entire codebase before creating anything new**
- First search for hooks in `src/hooks/[domain]/` and related directories
- Search for headless components in `src/ui/headless/[domain]/` and related directories
- Search for styled components in `src/ui/styled/[domain]/` and related directories
- Check for alternative naming patterns or locations if not found initially
- Use grep or other search tools to find any references to the component

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

**MAIN FOCUS: UPDATE IMPORT PATHS AND INTEGRATE COMPONENTS**

- **Update all import paths to use the new architecture structure:**
  - Hooks: `@/hooks/{domain}/use-{feature}`
  - Headless components: `@/ui/headless/{domain}/{Component}`
  - Styled components: `@/ui/styled/{domain}/{Component}`
  - Follow kebab-case for file imports, PascalCase for components

- **Replace direct database/API calls with hook methods:**
  - Remove any direct Supabase or API calls
  - Use the appropriate hook methods instead
  - Ensure proper error handling and loading states

- **Integrate the existing UI components:**
  - Use the headless components for behavior
  - Use the styled components for appearance
  - Maintain the current layout and user experience
  - Preserve all existing functionality

- Only if a component is truly missing after thorough searching, create a proper implementation following architecture guidelines

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

### 6. Creating New Components (When Needed)
If a required component is truly missing after thorough searching, create a proper implementation that:
- Strictly follows the architecture pattern (interface-based, headless pattern, etc.)
- Adheres to the correct file structure and naming conventions
- Implements full functionality according to domain requirements
- Includes comprehensive props, types, and error handling
- Follows the separation of concerns principle

Implementation order for new components:
1. First create the core interfaces (if needed)
2. Implement adapter interfaces (if needed)
3. Create service implementations
4. Develop hooks that use the services
5. Build headless components that use the hooks
6. Create styled components that use the headless components

Example implementation for a new component:
```tsx
// src/ui/headless/[domain]/NewComponent.tsx
import React from 'react';
import { use[Domain] } from '@/hooks/[domain]/use-[domain]';

export interface NewComponentProps {
  // Comprehensive props
  initialData?: [DomainType];
  loading?: boolean;
  error?: Error | null;
  onSubmit: (data: [DomainType]) => Promise<void>;
  onUpdate: (id: string, data: Partial<[DomainType]>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const NewComponent: React.FC<NewComponentProps> = ({
  initialData = [],
  loading = false,
  error = null,
  onSubmit,
  onUpdate,
  onDelete,
}) => {
  // Full implementation with proper state management and error handling
  const [data, setData] = React.useState(initialData);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Implement full component logic here
  // ...
  
  return (
    <div>
      {/* Implement full UI here */}
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
