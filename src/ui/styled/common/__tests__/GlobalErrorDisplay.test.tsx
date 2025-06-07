import { render, screen } from '@/tests/utils/testUtils';
import userEvent from '@testing-library/user-event';
import { act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GlobalErrorDisplay } from '@/ui/styled/common/GlobalErrorDisplay';
import { useErrorStore } from '@/lib/state/errorStore';

describe('GlobalErrorDisplay', () => {
  beforeEach(() => {
    act(() => {
      useErrorStore.setState({ globalQueue: [], sectionQueues: {}, history: [] });
    });
  });

  it('shows global error and handles retry', async () => {
    const retry = vi.fn();
    const user = userEvent.setup();
    act(() => {
      useErrorStore.getState().addError({ message: 'Boom', onRetry: retry });
    });
    render(<GlobalErrorDisplay />);
    const container = screen.getByRole('alert').parentElement?.parentElement as HTMLElement;
    expect(container).toHaveClass('fixed bottom-4 right-4 max-w-md w-full');
    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(retry).toHaveBeenCalled();
    expect(useErrorStore.getState().globalQueue.length).toBe(0);
  });

  it('renders nothing when there is no error', () => {
    const { container } = render(<GlobalErrorDisplay />);
    expect(container.firstChild).toBeNull();
  });
});
