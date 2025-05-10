import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Minimal Smoke Test', () => {
  it('renders a simple div', () => {
    render(<div>Hello, world!</div>);
    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
  });
}); 