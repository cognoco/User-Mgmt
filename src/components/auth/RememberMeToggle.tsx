'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface RememberMeToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function RememberMeToggle({ checked, onChange }: RememberMeToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="remember-me"
        checked={checked}
        onCheckedChange={value => onChange(value === true)}
      />
      <Label htmlFor="remember-me">Remember me</Label>
    </div>
  );
}
