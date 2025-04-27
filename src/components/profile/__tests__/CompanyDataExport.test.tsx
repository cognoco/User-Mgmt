import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CompanyDataExport from '../CompanyDataExport';

global.URL.createObjectURL = vi.fn(() => 'blob:url');

describe('CompanyDataExport', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders and allows company data export', async () => {
    const mockBlob = new Blob([JSON.stringify({ test: 'company' })], { type: 'application/json' });
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => mockBlob,
      headers: { get: () => 'attachment; filename="Company_Data_Export.json"' },
    });
    global.fetch = mockFetch;

    await act(async () => {
      render(<CompanyDataExport />);
    });

    expect(screen.getByText('Export Company Data')).toBeInTheDocument();
    
    const downloadButton = screen.getByText('Download Company Data');
    await userEvent.click(downloadButton);

    await waitFor(() => {
      expect(screen.getByText('Company data export has been downloaded successfully.')).toBeInTheDocument();
    });
  });

  it('shows error on export failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, text: async () => 'Error' });
    
    await act(async () => {
      render(<CompanyDataExport />);
    });

    const downloadButton = screen.getByText('Download Company Data');
    await userEvent.click(downloadButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to export company data.')).toBeInTheDocument();
    });
  });
});
