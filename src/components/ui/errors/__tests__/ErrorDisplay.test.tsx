import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import {
  ErrorDisplay,
  NetworkErrorDisplay,
  ValidationErrorDisplay,
  NotFoundErrorDisplay,
  PermissionErrorDisplay,
} from '@/src/components/ui/errors/ErrorDisplay'192;
import { toast } from '@/lib/hooks/useToast'349;

vi.mock('@/lib/hooks/use-toast', () => {
  return {
    toast: vi.fn(),
  };
});

describe('ErrorDisplay', () => {
  it('renders inline error and triggers retry', async () => {
    const retry = vi.fn();
    const user = userEvent.setup();
    render(<ErrorDisplay message="Failed" onRetry={retry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed');
    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(retry).toHaveBeenCalled();
  });

  it('shows toast for toast style', () => {
    render(<ErrorDisplay message="Toast error" style="toast" />);
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Toast error' }));
  });

  it('renders modal when style modal', () => {
    render(<ErrorDisplay message="Modal" style="modal" isOpen onOpenChange={() => {}} />);
    expect(screen.getByText('Modal')).toBeInTheDocument();
  });

  it('has accessible alert attributes', () => {
    render(<ErrorDisplay message="Accessible" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('specialized component uses defaults', () => {
    render(<NetworkErrorDisplay />);
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: expect.stringContaining('Network error') }));

    render(<ValidationErrorDisplay message="Form invalid" />);
    expect(screen.getByText('Form invalid')).toBeInTheDocument();

    render(<NotFoundErrorDisplay />);
    expect(screen.getByText(/requested resource/)).toBeInTheDocument();

    render(<PermissionErrorDisplay />);
    expect(screen.getByText(/permission to perform/)).toBeInTheDocument();
  });
});
