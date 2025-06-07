import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PageLoader } from '@/ui/primitives/pageLoader';

describe('PageLoader', () => {
  it('renders spinner and label', () => {
    render(<PageLoader label="Waiting" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Waiting');
    expect(screen.getByText('Waiting')).toBeInTheDocument();
  });
});
