import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DataExport from '@/src/ui/styled/profile/DataExport'154;

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
    // Ensure window.URL.revokeObjectURL exists
    if (!window.URL.revokeObjectURL) {
      window.URL.revokeObjectURL = () => {};
    }
    // Create a real anchor element
    const a = document.createElement('a');
    document.body.appendChild(a);
    const clickSpy = vi.spyOn(a, 'click').mockImplementation(() => {});
    const originalCreateElement = document.createElement;
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') return a;
      return originalCreateElement.call(document, tag);
    });
    const revokeSpy = vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {});

    await act(async () => {
      await userEvent.click(downloadButton);
    });
    // Assert the success message is shown
    expect(
      screen.getByText('Your data export has been downloaded successfully.')
    ).toBeInTheDocument();
    // Clean up mocks
    clickSpy.mockRestore();
    revokeSpy.mockRestore();
    (document.createElement as any).mockRestore && (document.createElement as any).mockRestore();
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
