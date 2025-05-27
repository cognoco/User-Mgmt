import { useEffect } from 'react';

export interface Shortcut {
  keys: string[];
  description: string;
  handler: () => void;
}

/**
 * Registers global keyboard shortcuts.
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      shortcuts.forEach(({ keys, handler }) => {
        if (keys.every(k => (k === 'Shift' ? e.shiftKey : e.key.toLowerCase() === k.toLowerCase()))) {
          e.preventDefault();
          handler();
        }
      });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [shortcuts]);
}
