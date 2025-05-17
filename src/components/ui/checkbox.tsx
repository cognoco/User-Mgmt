import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';

import { cn } from '@/lib/utils';

// Fix for React 19 - simplified component implementation
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => {
  // Simple component structure without useMemo
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      role="checkbox"
      aria-checked={
        typeof props.checked === 'boolean'
          ? props.checked
          : props.checked === 'indeterminate'
            ? 'mixed'
            : typeof props.checked === 'string'
              ? props.checked
              : typeof props.defaultChecked === 'boolean'
                ? props.defaultChecked
                : props.defaultChecked === 'indeterminate'
                  ? 'mixed'
                  : 'false'
      }
      tabIndex={0}
      className={cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn('flex items-center justify-center text-current')}
      >
        <CheckIcon className="h-4 w-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});

// Ensure displayName is set for DevTools
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
