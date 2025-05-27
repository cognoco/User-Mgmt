# Loading Patterns

This document outlines the available loading components and how to integrate them.

## Skeleton Loaders

```tsx
import { Skeleton } from '@/components/ui/skeleton';

export function UserCardSkeleton() {
  return (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
  );
}
```

## Progress Indicator

```tsx
import { Progress } from '@/components/ui/progress';

<Progress value={60} className="h-2" />
```

## Inline Button Loading

```tsx
import { LoadingButton } from '@/components/ui/loading-button';

<LoadingButton isLoading onClick={save}>Save</LoadingButton>
```

## Full Page Loading

```tsx
import { PageLoader } from '@/components/ui/page-loader';

// In layout or suspense fallback
<PageLoader label="Loading application" />
```

## Optimistic Updates

```tsx
import { useOptimistic } from '@/hooks/useOptimistic';

const { data, run } = useOptimistic(initialData);

async function handleUpdate(newValue: number) {
  await run(apiUpdate, newValue);
}
```
