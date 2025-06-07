// @vitest-environment jsdom
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DataExportRequest } from '@/src/ui/styled/gdpr/DataExportRequest';

vi.mock('../../headless/gdpr/DataExportRequest', () => ({
  DataExportRequest: ({ render }: any) => render({ requestExport: vi.fn(), isLoading: false, error: null })
}));

describe('DataExportRequest styled', () => {
  it('renders button', () => {
    const { getByRole } = render(<DataExportRequest />);
    fireEvent.click(getByRole('button'));
    expect(getByRole('button')).toBeInTheDocument();
  });
});
