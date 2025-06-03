import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

function ProblemChild() {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('renders fallback on error and recovers', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    rerender(
      <ErrorBoundary>
        <div>safe</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('safe')).toBeInTheDocument();
  });
});
