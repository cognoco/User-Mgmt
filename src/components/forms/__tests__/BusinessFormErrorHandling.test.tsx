import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BusinessRegistrationForm } from '@/ui/styled/auth/BusinessRegistrationForm';
import { CompanyEditForm } from '@/ui/styled/company/CompanyEditForm';

// Mock form submission handlers
const mockSubmit = vi.fn();
const mockOnError = vi.fn();

describe('Business Form Error Handling', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Business Registration Form', () => {
    test('handles duplicate company name error from server', async () => {
      const user = userEvent.setup();
      
      // Render with mock handlers
      render(
        <BusinessRegistrationForm 
          onSubmit={mockSubmit} 
          onError={mockOnError} 
          serverError={{
            type: 'company_name_exists',
            message: 'A company with this name already exists'
          }}
        />
      );
      
      // Check that error message is displayed
      expect(screen.getByText('A company with this name already exists')).toBeInTheDocument();
      
      // Fill in company name field again
      const companyNameField = screen.getByLabelText(/company name/i);
      await user.clear(companyNameField);
      await user.type(companyNameField, 'Different Company Name');
      
      // Error should be cleared when field is changed
      expect(screen.queryByText('A company with this name already exists')).not.toBeInTheDocument();
    });
    
    test('handles duplicate email error from server', async () => {
      const user = userEvent.setup();
      
      // Render with mock handlers
      render(
        <BusinessRegistrationForm 
          onSubmit={mockSubmit} 
          onError={mockOnError}
          serverError={{
            type: 'email_exists',
            message: 'This email is already registered'
          }}
        />
      );
      
      // Check that error message is displayed
      expect(screen.getByText('This email is already registered')).toBeInTheDocument();
      
      // Fill in email field again
      const emailField = screen.getByLabelText(/email/i);
      await user.clear(emailField);
      await user.type(emailField, 'different@example.com');
      
      // Error should be cleared when field is changed
      expect(screen.queryByText('This email is already registered')).not.toBeInTheDocument();
    });
    
    test('validates and provides feedback for weak passwords', async () => {
      const user = userEvent.setup();
      
      render(<BusinessRegistrationForm onSubmit={mockSubmit} onError={mockOnError} />);
      
      // Fill in a weak password
      const passwordField = screen.getByLabelText(/password/i);
      await user.type(passwordField, 'weak');
      
      // Should show password strength feedback
      expect(screen.getByText(/password is too weak/i)).toBeInTheDocument();
      
      // Enter a strong password
      await user.clear(passwordField);
      await user.type(passwordField, 'StrongPassword123!');
      
      // Should show positive feedback
      expect(screen.getByText(/password strength: strong/i)).toBeInTheDocument();
    });
    
    test('validates matching passwords', async () => {
      const user = userEvent.setup();
      
      render(<BusinessRegistrationForm onSubmit={mockSubmit} onError={mockOnError} />);
      
      // Fill in non-matching passwords
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPassword123!');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /register/i }));
      
      // Should show password mismatch error
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      
      // Fix the confirm password
      const confirmPasswordField = screen.getByLabelText(/confirm password/i);
      await user.clear(confirmPasswordField);
      await user.type(confirmPasswordField, 'Password123!');
      
      // Error should be cleared
      expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
    });
    
    test('validates company website URL format', async () => {
      const user = userEvent.setup();
      
      render(<BusinessRegistrationForm onSubmit={mockSubmit} onError={mockOnError} />);
      
      // Fill in company website with invalid URL
      const websiteField = screen.getByLabelText(/company website/i);
      await user.type(websiteField, 'not-a-url');
      
      // Move focus to trigger validation
      await user.tab();
      
      // Should show URL format error
      expect(screen.getByText(/enter a valid URL/i)).toBeInTheDocument();
      
      // Fix the URL
      await user.clear(websiteField);
      await user.type(websiteField, 'https://example.com');
      
      // Error should be cleared
      expect(screen.queryByText(/enter a valid URL/i)).not.toBeInTheDocument();
    });
  });
  
  describe('Company Edit Form', () => {
    test('handles company name typos with suggestions', async () => {
      const user = userEvent.setup();
      
      // Setup mock suggestions API
      const mockSuggestCompanyName = vi.fn().mockImplementation((name) => {
        if (name.toLowerCase() === 'acem') {
          return Promise.resolve(['Acme Inc', 'Acer', 'Ace Hardware']);
        }
        return Promise.resolve([]);
      });
      
      // Render with company data and suggestion handler
      render(
        <CompanyEditForm 
          companyData={{
            id: 'company-123',
            name: '',
            size: '1-10',
            industry: 'Technology'
          }}
          onSubmit={mockSubmit}
          onSuggestCompanyName={mockSuggestCompanyName}
        />
      );
      
      // Type a company name with a typo
      const nameField = screen.getByLabelText(/company name/i);
      await user.type(nameField, 'Acem');
      
      // Wait for suggestions to appear
      await waitFor(() => {
        expect(mockSuggestCompanyName).toHaveBeenCalledWith('Acem');
      });
      
      // Suggestions should be displayed
      expect(screen.getByText('Did you mean:')).toBeInTheDocument();
      expect(screen.getByText('Acme Inc')).toBeInTheDocument();
      
      // Click on a suggestion
      await user.click(screen.getByText('Acme Inc'));
      
      // Field should be updated with suggestion
      expect(nameField).toHaveValue('Acme Inc');
    });
    
    test('warns when changing fields that trigger re-verification', async () => {
      const user = userEvent.setup();
      
      // Render with verified company data
      render(
        <CompanyEditForm 
          companyData={{
            id: 'company-123',
            name: 'Verified Company',
            size: '11-50',
            industry: 'Technology',
            isVerified: true
          }}
          onSubmit={mockSubmit}
        />
      );
      
      // Change the company name
      const nameField = screen.getByLabelText(/company name/i);
      await user.clear(nameField);
      await user.type(nameField, 'New Company Name');
      
      // Warning should appear
      expect(screen.getByText(/changing company name will require re-verification/i)).toBeInTheDocument();
      
      // Change a non-critical field
      const sizeField = screen.getByLabelText(/company size/i);
      await user.click(sizeField);
      await user.click(screen.getByText('51-200'));
      
      // No warning for this field
      expect(screen.queryByText(/changing company size will require re-verification/i)).not.toBeInTheDocument();
    });
    
    test('shows appropriate errors for invalid contact information', async () => {
      const user = userEvent.setup();
      
      render(
        <CompanyEditForm 
          companyData={{
            id: 'company-123',
            name: 'Test Company',
            size: '11-50',
            industry: 'Technology'
          }}
          onSubmit={mockSubmit}
        />
      );
      
      // Enter invalid contact email
      const contactEmailField = screen.getByLabelText(/contact email/i);
      await user.type(contactEmailField, 'not-an-email');
      
      // Enter invalid phone
      const phoneField = screen.getByLabelText(/phone/i);
      await user.type(phoneField, '123'); // Too short
      
      // Try to submit
      await user.click(screen.getByRole('button', { name: /save/i }));
      
      // Should show format errors
      expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/enter a valid phone number/i)).toBeInTheDocument();
      
      // Fix the email
      await user.clear(contactEmailField);
      await user.type(contactEmailField, 'contact@example.com');
      
      // The email error should be cleared
      expect(screen.queryByText(/enter a valid email address/i)).not.toBeInTheDocument();
      
      // But phone error should remain
      expect(screen.getByText(/enter a valid phone number/i)).toBeInTheDocument();
    });
    
    test('handles concurrent edit conflicts gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock submit to simulate concurrent edit error
      const mockConcurrentEditSubmit = vi.fn().mockRejectedValue({
        response: {
          status: 409,
          data: {
            error: 'Concurrent edit conflict',
            message: 'This record has been modified by another user'
          }
        }
      });
      
      render(
        <CompanyEditForm 
          companyData={{
            id: 'company-123',
            name: 'Test Company',
            size: '11-50',
            industry: 'Technology',
            updatedAt: '2023-01-01T00:00:00Z'
          }}
          onSubmit={mockConcurrentEditSubmit}
        />
      );
      
      // Make a change
      await user.clear(screen.getByLabelText(/company name/i));
      await user.type(screen.getByLabelText(/company name/i), 'Updated Company Name');
      
      // Submit the form
      await user.click(screen.getByRole('button', { name: /save/i }));
      
      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByText(/this record has been modified by another user/i)).toBeInTheDocument();
      });
      
      // Should show options
      expect(screen.getByText(/you can reload to see the latest changes or override them/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /override/i })).toBeInTheDocument();
    });
  });
}); 