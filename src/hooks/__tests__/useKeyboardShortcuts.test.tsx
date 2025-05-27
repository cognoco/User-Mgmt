import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts, Shortcut } from '../useKeyboardShortcuts';

const shortcut: Shortcut = {
  keys: ['Shift', '?'],
  description: 'Test',
  handler: vi.fn(),
};

describe('useKeyboardShortcuts', () => {
  it('calls handler when keys pressed', () => {
    const { unmount } = renderHook(() => useKeyboardShortcuts([shortcut]));
    const event = new KeyboardEvent('keydown', { key: '?', shiftKey: true });
    window.dispatchEvent(event);
    expect(shortcut.handler).toHaveBeenCalled();
    unmount();
  });
});
