import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/primitives/dialog';
import { Button } from '@/ui/primitives/button';
import { Keyboard } from 'lucide-react';
import React from 'react';

export function KeyboardShortcutsHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Keyboard className="h-4 w-4 mr-1" />
          <span>Keyboard Shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use these keyboard shortcuts to navigate the user management system more efficiently.
          </p>

          <div className="border rounded-md divide-y">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.key} className="p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{shortcut.description}</p>
                  {shortcut.details && (
                    <p className="text-xs text-muted-foreground mt-1">{shortcut.details}</p>
                  )}
                </div>
                <kbd className="px-2 py-1 bg-muted rounded-md text-sm font-mono">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const shortcuts = [
  { key: '/', description: 'Focus search input' },
  { key: 'F', description: 'Focus on filters' },
  { key: '⌘ + S', description: 'Save current search' },
  { key: '⌘ + E', description: 'Export current results' },
  { key: 'R', description: 'Refresh results' },
  { key: 'Tab', description: 'Navigate through elements', details: 'Use Tab to move forward, Shift+Tab to move backward' },
  { key: 'Space/Enter', description: 'Activate buttons, toggle filters', details: 'When an interactive element is focused' },
  { key: 'Esc', description: 'Close modal dialogs' },
];
