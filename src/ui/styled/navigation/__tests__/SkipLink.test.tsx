import { render, screen } from '@/tests/utils/testUtils'0;
import { SkipLink } from '@/src/ui/styled/navigation/SkipLink'60;

describe('SkipLink', () => {
  it('renders an anchor with correct href', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toHaveAttribute('href', '#main-content');
  });
});
