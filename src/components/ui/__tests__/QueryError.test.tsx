import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { QueryError } from '@/src/components/ui/QueryError';

vi.useFakeTimers();

describe('QueryError', () => {
  it('calls retry automatically when autoRetry is true', async () => {
    const retry = vi.fn().mockResolvedValue(undefined);
    render(<QueryError error="fail" onRetry={retry} autoRetry maxRetries={1} />);
    await act(() => {
      vi.runAllTimers();
    });
    expect(retry).toHaveBeenCalled();
  });

  it('renders help link when provided', () => {
    render(<QueryError error="fail" helpUrl="/help" />);
    const link = screen.getByRole('link', { name: /need help/i });
    expect(link).toHaveAttribute('href', '/help');
  });

  it('triggers retry on button click', async () => {
    const retry = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<QueryError error="fail" onRetry={retry} />);
    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(retry).toHaveBeenCalled();
  });
});
