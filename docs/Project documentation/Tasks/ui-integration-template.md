# UI Integration Template for New Architecture Components

## Overview
This template provides standardized instructions for integrating domain-specific components into the existing UI pages following the new architecture. Each developer should adapt this template to their assigned domain (2FA, Address Management, GDPR, etc.).

## Integration Strategy
1. **Analyze Current Implementation**
   - Identify direct database calls in existing pages
   - Note current UI patterns and user experience elements

2. **Import Domain-Specific Hooks**
   - Add the relevant hooks from `src/hooks/{domain}/use-{feature}.ts`
   - Replace direct database access with hook methods

3. **Integrate UI Components**
   - Add headless components for behavior (`src/ui/headless/{domain}/`)
   - Apply styled components for consistent UI (`src/ui/styled/{domain}/`)

4. **Update Navigation** (if needed)
   - Add new page links to appropriate navigation components

## Page Implementation Template

```tsx
// app/{section}/{domain}/page.tsx

'use client';
import { use{Domain} } from '@/hooks/{domain}/use-{domain}';
import { {Component}List } from '@/ui/styled/{domain}/{Component}List';
import { {Component}Form } from '@/ui/styled/{domain}/{Component}Form';

export default function {Domain}Page() {
  // Use the appropriate hook
  const {
    items,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    // Other domain-specific methods...
  } = use{Domain}();
  
  return (
    <div className="container mx-auto py-8 space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold">{Domain} Management</h1>
      
      {/* Form Section */}
      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Add New {Domain}</h2>
        <{Component}Form 
          onSubmit={createItem}
          loading={loading}
          error={error}
        />
      </div>
      
      {/* List Section */}
      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">{Domain} List</h2>
        <{Component}List 
          items={items}
          loading={loading}
          error={error}
          onUpdate={updateItem}
          onDelete={deleteItem}
          // Other domain-specific props...
        />
      </div>
    </div>
  );
}
```

## Example: Address Management Integration

```tsx
// app/team/addresses/page.tsx

'use client';
import { useAddresses } from '@/hooks/address/use-addresses';
import { AddressList } from '@/ui/styled/address/AddressList';
import { AddressForm } from '@/ui/styled/address/AddressForm';

export default function TeamAddressesPage() {
  const {
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
  } = useAddresses();
  
  return (
    <div className="container mx-auto py-8 space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold">Team Addresses</h1>
      
      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Address</h2>
        <AddressForm 
          onSubmit={addAddress}
          loading={loading}
          error={error}
        />
      </div>
      
      <div className="bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Saved Addresses</h2>
        <AddressList 
          addresses={addresses}
          loading={loading}
          error={error}
          onUpdate={updateAddress}
          onDelete={deleteAddress}
          onSetDefault={setDefaultAddress}
        />
      </div>
    </div>
  );
}
```

## Implementation Notes
- Ensure all components follow the architecture guidelines
- Maintain separation between UI and business logic
- Use only the established tech stack
- Follow file structure conventions in `docs/File structure guidelines.md`
- Reference appropriate documentation for each domain

## Deliverables
1. New page component using the hooks and UI components
2. Navigation updates (if applicable)
3. Any necessary adjustments to existing components

## Completion Criteria
- Page renders correctly with all components
- All functionality works as expected
- Code follows architecture guidelines
- No direct database access in UI components
