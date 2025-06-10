'use client';
import { Control, Controller } from 'react-hook-form';
import { Input } from '@/ui/primitives/input';

interface DatePickerProps {
  control: Control<any>;
  name: string;
  placeholder?: string;
}

export function DatePicker({ control, name, placeholder }: DatePickerProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Input
          type="date"
          placeholder={placeholder}
          value={field.value ? new Date(field.value).toISOString().substring(0, 10) : ''}
          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
        />
      )}
    />
  );
}
