import { render, screen } from '@/tests/utils/testUtils';
import { SkipLink } from '@/ui/styled/navigation/SkipLink';

describe('SkipLink', () => {
  it('renders an anchor with correct href', () => {
    render(<SkipLink />);
    const link = screen.getByRole('link', { name: /skip to main content/i });
    expect(link).toHaveAttribute('href', '#main-content');
  });
});
