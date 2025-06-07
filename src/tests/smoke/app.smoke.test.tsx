import React from 'react';
import { render, screen } from '@/src/tests/utils/testUtils'28;
import HomePage from '@/app/page'83;
import { describe, it, expect } from 'vitest';

describe('Smoke: App Entry', () => {
  it('renders the main HomePage without crashing', () => {
    render(<HomePage />);
    expect(screen.getByText(/Welcome to User Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Key Features/i)).toBeInTheDocument();
  });
}); 