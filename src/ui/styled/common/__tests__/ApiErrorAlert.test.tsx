import { render, screen } from '@/tests/utils/testUtils'0;
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ApiErrorAlert } from '@/src/ui/styled/common/ApiErrorAlert'166;

describe('ApiErrorAlert', () => {
  it('renders message and calls retry', async () => {
    const user = userEvent.setup();
    const retry = vi.fn();
    render(<ApiErrorAlert message="Oops" onRetry={retry} />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Oops');
    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(retry).toHaveBeenCalled();
  });

  it('renders nothing when message is null', () => {
    const { container } = render(<ApiErrorAlert message={null} />);
    expect(container.firstChild).toBeNull();
  });
});
