import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DataExport from '../DataExport';

global.URL.createObjectURL = vi.fn(() => 'blob:url');

describe('DataExport', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders and allows data export', async () => {
    const mockBlob = new Blob([JSON.stringify({ test: 'data' })], { type: 'application/json' });
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => mockBlob,
      headers: { get: () => 'attachment; filename="Personal_Data_Export.json"' },
    });
    global.fetch = mockFetch;
    render(<DataExport />);
    expect(screen.getByText('Export Your Data')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Download My Data'));
    await waitFor(() => {
      expect(screen.getByText('Your data export has been downloaded successfully.')).toBeInTheDocument();
    });
  });

  it('shows error on export failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, text: async () => 'Error' });
    render(<DataExport />);
    fireEvent.click(screen.getByText('Download My Data'));
    await waitFor(() => {
      expect(screen.getByText('Failed to export your data.')).toBeInTheDocument();
    });
  });
});
