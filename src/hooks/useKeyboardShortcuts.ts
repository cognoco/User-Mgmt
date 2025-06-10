import { useEffect } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;
type KeyMap = Record<string, KeyHandler>;

interface KeyboardShortcutOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(
  keyMap: KeyMap,
  options: KeyboardShortcutOptions = {}
) {
  const { enabled = true, preventDefault = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const keyPressed = event.key.toLowerCase();
      const withMeta = event.metaKey || event.ctrlKey;
      const withShift = event.shiftKey;
      const keyCombo = [
        withMeta ? 'meta+' : '',
        withShift ? 'shift+' : '',
        keyPressed,
      ].join('');

      const handler = keyMap[keyCombo] || keyMap[keyPressed];
      if (handler) {
        if (preventDefault) {
          event.preventDefault();
        }
        handler(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keyMap, enabled, preventDefault]);
}
