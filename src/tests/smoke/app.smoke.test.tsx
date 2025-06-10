import React from 'react';
import { render, screen } from '@/tests/utils/testUtils';
import HomePage from '@app/page';
import { describe, it, expect } from 'vitest';

describe('Smoke: App Entry', () => {
  it('renders the main HomePage without crashing', () => {
    render(<HomePage />);
    expect(screen.getByText(/Welcome to User Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Key Features/i)).toBeInTheDocument();
  });
}); 