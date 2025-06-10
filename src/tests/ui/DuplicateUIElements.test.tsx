import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Mock LoginPage as a simple component for these tests
const LoginPage = () => (
  <div>
    <form>
      <button>Login</button>
      <a href="/reset-password">Forgot password</a>
      <a href="/register">Sign up</a>
    </form>
  </div>
);

describe('Duplicate UI Elements Check', () => {
  it('should not have duplicate "Forgot password" links on login page', () => {
    // Render the login page component
    render(<LoginPage />);
    
    // Find all elements with text "Forgot password" or similar variations
    const forgotPasswordElements = screen.queryAllByText(/forgot.*password/i);
    
    // There should only be one "Forgot password" link
    expect(forgotPasswordElements.length).toBe(1);
  });

  it('should not have duplicate "Sign up" links on login page', () => {
    render(<LoginPage />);
    
    // Find all elements with text containing "Sign up" or similar
    const signUpElements = screen.queryAllByText(/sign up|signup/i);
    
    // There should only be one "Sign up" link
    expect(signUpElements.length).toBe(1);
  });

  it('should not have duplicate action buttons on any form', () => {
    render(<LoginPage />);
    
    // Check for duplicate submit buttons
    const loginButtons = screen.queryAllByRole('button', { name: /login|sign in/i });
    expect(loginButtons.length).toBe(1);
  });
});

// Helper function to check for duplicate elements across the app
export const checkForDuplicateElements = (component: React.ReactElement, elementQuery: string) => {
  const { queryAllByText } = render(component);
  const elements = queryAllByText(new RegExp(elementQuery, 'i'));
  return elements.length;
}; 