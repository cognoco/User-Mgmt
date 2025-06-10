import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/ui/primitives/button';
import { Label } from '@/ui/primitives/label';
import React from 'react';

interface AccessibleFilterProps {
  id: string;
  label: string;
  isOpen?: boolean;
  onClear?: () => void;
  hasClearButton?: boolean;
  children: React.ReactNode;
}

export function AccessibleFilter({
  id,
  label,
  isOpen: defaultIsOpen = false,
  onClear,
  hasClearButton = false,
  children,
}: AccessibleFilterProps) {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-muted/30">
        <Label
          htmlFor={id}
          className="text-sm font-medium flex items-center cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          {label}
        </Label>
        <div className="flex items-center gap-2">
          {hasClearButton && onClear && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={onClear}
              aria-label={`Clear ${label} filter`}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls={`${id}-content`}
            aria-label={isOpen ? `Collapse ${label} filter` : `Expand ${label} filter`}
            className="h-7 px-2"
          >
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {isOpen && (
        <div id={`${id}-content`} className="p-3">
          {children}
        </div>
      )}
    </div>
  );
}
