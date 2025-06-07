import { render, screen, fireEvent } from '@/tests/utils/testUtils'0;
import { KeyboardShortcutsDialog } from '@/src/ui/styled/common/KeyboardShortcutsDialog'71;

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
