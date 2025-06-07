// @vitest-environment jsdom
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DataDeletionRequest } from '@/src/ui/styled/gdpr/DataDeletionRequest';

vi.mock('../../../headless/gdpr/DataDeletionRequest', () => ({
  DataDeletionRequest: ({ render }: any) =>
    render({ requestDeletion: vi.fn(), isLoading: false, error: null })
}));

describe('DataDeletionRequest styled', () => {
  it('renders button', () => {
    const { getByRole } = render(<DataDeletionRequest />);
    fireEvent.click(getByRole('button'));
    expect(getByRole('button')).toBeInTheDocument();
  });
});
