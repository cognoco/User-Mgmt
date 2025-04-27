import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

    await act(async () => {
      render(<DataExport />);
    });

    expect(screen.getByText('Export Your Data')).toBeInTheDocument();

    const downloadButton = screen.getByText('Download My Data');
    await userEvent.click(downloadButton);

    await waitFor(() => {
      expect(screen.getByText('Your data export has been downloaded successfully.')).toBeInTheDocument();
    });
  });

  it('shows error on export failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, text: async () => 'Error' });
    
    await act(async () => {
      render(<DataExport />);
    });

    const downloadButton = screen.getByText('Download My Data');
    await userEvent.click(downloadButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to export your data.')).toBeInTheDocument();
    });
  });
});
