import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { LoadingButton } from '@/src/ui/primitives/loadingButton';

describe('LoadingButton', () => {
  it('shows spinner when loading and disables button', async () => {
    render(
      <LoadingButton isLoading>Submit</LoadingButton>
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(screen.getByTestId('button-spinner')).toBeInTheDocument();
  });

  it('calls onClick when not loading', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<LoadingButton onClick={fn}>Ok</LoadingButton>);
    await user.click(screen.getByRole('button'));
    expect(fn).toHaveBeenCalled();
  });
});
