import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BackupCodesDisplay } from '@/components/auth/BackupCodesDisplay';
import { MFAVerificationForm } from '@/components/auth/MFAVerificationForm';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const backupCodes = [
  'ABCD-1234',
  'EFGH-5678',
  'IJKL-9012',
  'MNOP-3456',
  'QRST-7890',
  'UVWX-2345',
  'YZAB-6789',
  'CDEF-0123',
  'GHIJ-4567',
  'KLMN-8901',
];

const server = setupServer(
  rest.post('/api/2fa/backup-codes', (req, res, ctx) => {
    return res(ctx.json({ codes: backupCodes }));
  }),
  rest.post('/api/2fa/backup-codes/verify', (req, res, ctx) => {
    const { code } = req.body as { code: string };
    if (backupCodes.includes(code)) {
      return res(ctx.json({ success: true }));
    }
    return res(ctx.status(400), ctx.json({ error: 'Invalid backup code.' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('Backup Codes Integration', () => {
  it('displays and allows download/copy/regenerate of backup codes', async () => {
    renderWithClient(<BackupCodesDisplay showRegenerateOption={true} />);
    await waitFor(() => {
      backupCodes.forEach(code => {
        expect(screen.getByText(code)).toBeInTheDocument();
      });
    });
    // Simulate download and copy (clipboard API is stubbed in jsdom)
    fireEvent.click(screen.getByText(/download/i));
    fireEvent.click(screen.getByText(/copy/i));
    // Regenerate
    fireEvent.click(screen.getByText(/regenerate/i));
    await waitFor(() => {
      expect(screen.getByText(backupCodes[0])).toBeInTheDocument();
    });
  });

  it('verifies a valid backup code in MFAVerificationForm', async () => {
    const onSuccess = jest.fn();
    renderWithClient(
      <MFAVerificationForm accessToken="dummy" onSuccess={onSuccess} />
    );
    // Switch to backup code mode
    fireEvent.click(screen.getByText(/use backup code/i));
    fireEvent.change(screen.getByPlaceholderText('XXXX-XXXX'), { target: { value: backupCodes[0] } });
    fireEvent.click(screen.getByText(/verify/i));
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('shows error for invalid backup code in MFAVerificationForm', async () => {
    const onSuccess = jest.fn();
    renderWithClient(
      <MFAVerificationForm accessToken="dummy" onSuccess={onSuccess} />
    );
    fireEvent.click(screen.getByText(/use backup code/i));
    fireEvent.change(screen.getByPlaceholderText('XXXX-XXXX'), { target: { value: 'WRONG-0000' } });
    fireEvent.click(screen.getByText(/verify/i));
    await waitFor(() => {
      expect(screen.getByText(/invalid backup code/i)).toBeInTheDocument();
    });
  });
});
