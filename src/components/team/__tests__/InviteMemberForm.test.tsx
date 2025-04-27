import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InviteMemberForm } from '../InviteMemberForm';
import { useTeamInvite } from '../../../hooks/useTeamInvite';
import { vi, Mock } from 'vitest';

// Mock the useTeamInvite hook
vi.mock('../../../hooks/useTeamInvite', () => ({
  useTeamInvite: vi.fn(),
}));

describe('InviteMemberForm', () => {
  const mockTeamLicenseId = 'test-license-id';
  const mockOnInviteSent = vi.fn();
  const mockSendInvite = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useTeamInvite as Mock).mockReturnValue({
      mutate: mockSendInvite,
    });
  });

  it('renders the form with all fields', async () => {
    await act(async () => {
      render(<InviteMemberForm teamLicenseId={mockTeamLicenseId} />);
    });

    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /role/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send invitation/i })).toBeInTheDocument();
  });

  it('validates required email', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<InviteMemberForm teamLicenseId={mockTeamLicenseId} />);
    });

    // Do not type anything in the email field

    const submitButton = screen.getByRole('button', { name: /send invitation/i });
    await act(async () => {
      await user.click(submitButton); // Click submit to trigger validation
    });

    // Explicitly wait for the message after submit attempt
    // Check specifically for the message linked to the email input
    // const emailInput = screen.getByRole('textbox', { name: /email/i }); // Remove unused variable
    // Check for the Zod message defined in the schema for the email field
    // Using findByText which combines getByText and waitFor
    expect(await screen.findByText(/Please enter a valid email address/i)).toBeInTheDocument();
    
    // Verify onSubmit wasn't called
    expect(mockSendInvite).not.toHaveBeenCalled(); 
  });

  // Un-skip the test and fix interaction with Radix UI Select
  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(
        <InviteMemberForm 
          teamLicenseId={mockTeamLicenseId} 
          onInviteSent={mockOnInviteSent} 
        />
      );
    });
    
    // Fill in form
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    await act(async () => {
      await user.type(emailInput, 'test@example.com');
    });
    
    // Interact with Shadcn/Radix Select - Target HIDDEN native select
    const hiddenSelect = screen.getByRole('combobox', { name: /role/i }); // Get the visible trigger first
    const associatedHiddenSelect = hiddenSelect.nextElementSibling as HTMLSelectElement; // Assume hidden select follows trigger
    if (associatedHiddenSelect && associatedHiddenSelect.tagName === 'SELECT') {
      await act(async () => {
        await user.selectOptions(associatedHiddenSelect, 'admin');
      });
    } else {
      throw new Error('Could not find the hidden select element to interact with.');
    }
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /send invitation/i });
    await act(async () => {
      await user.click(submitButton);
    });

    // Verify submission
    await waitFor(() => {
      expect(mockSendInvite).toHaveBeenCalledWith({
        email: 'test@example.com',
        role: 'admin', // Verify the selected role is sent
        teamLicenseId: mockTeamLicenseId,
      });
    });

    expect(mockOnInviteSent).toHaveBeenCalled();
  });

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup();
    mockSendInvite.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    await act(async () => {
      render(<InviteMemberForm teamLicenseId={mockTeamLicenseId} />);
    });
    
    // Fill in form
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    await act(async () => {
      await user.type(emailInput, 'test@example.com');
    });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /send invitation/i });
    await act(async () => {
      await user.click(submitButton);
    });

    expect(screen.getByText(/sending invitation/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText(/send invitation/i)).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('handles submission errors', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to send invitation';
    mockSendInvite.mockImplementation(() => Promise.reject(new Error(errorMessage)));
    
    await act(async () => {
      render(<InviteMemberForm teamLicenseId={mockTeamLicenseId} />);
    });
    
    // Fill in form
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    await act(async () => {
      await user.type(emailInput, 'test@example.com');
    });
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /send invitation/i });
    await act(async () => {
      await user.click(submitButton);
    });

    // Wait for the component to finish processing the error (e.g., re-enabling button)
    await waitFor(() => {
      // Button should be re-enabled after the error
      expect(submitButton).not.toBeDisabled(); 
      // Button text should revert
      expect(screen.getByRole('button', { name: /send invitation/i })).toBeInTheDocument();
    });

    // Verify the invite function was still called
    expect(mockSendInvite).toHaveBeenCalledTimes(1);
  });
}); 
