import { render, screen } from '@/tests/utils/testUtils';
import { describe, it, expect } from 'vitest';
import { DevErrorDetailsPanel } from '@/src/ui/styled/common/DevErrorDetailsPanel';
import type { ErrorEntry } from '@/lib/state/errorStore';

const error: ErrorEntry & { stack?: string } = {
  id: '1',
  message: 'Boom',
  timestamp: Date.now(),
  stack: 'Error: Boom\n    at src/app/page.tsx:1:1',
};

describe('DevErrorDetailsPanel', () => {
  it('renders stack trace and link', () => {
    render(<DevErrorDetailsPanel error={error} />);
    expect(screen.getByTestId('stack-trace')).toBeInTheDocument();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', expect.stringContaining('vscode://file'));
  });
});
