import { render, screen, fireEvent } from '@/tests/utils/test-utils';
import { KeyboardShortcutsDialog } from '../KeyboardShortcutsDialog';

const shortcuts = [
  { keys: ['?'], description: 'Open help' }
];

describe('KeyboardShortcutsDialog', () => {
  it('shows shortcuts when button clicked', () => {
    render(<KeyboardShortcutsDialog shortcuts={shortcuts} />);
    const button = screen.getByRole('button', { name: /show keyboard shortcuts/i });
    fireEvent.click(button);
    expect(screen.getByText('Open help')).toBeInTheDocument();
  });
});
