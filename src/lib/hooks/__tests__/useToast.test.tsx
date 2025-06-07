import React from 'react';
import { render } from '@testing-library/react';
import { act, waitFor } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { useToast, toast } from '@/src/lib/hooks/useToast'184;

const renderCounts = { current: 0 };

const TestComponent = () => {
  renderCounts.current += 1;
  useToast();
  return null;
};

describe('useToast', () => {
  test('registers listener only once', async () => {
    render(<TestComponent />);

    expect(renderCounts.current).toBe(1);

    act(() => {
      toast({ title: 'first' });
    });

    await waitFor(() => expect(renderCounts.current).toBe(2));

    act(() => {
      toast({ title: 'second' });
    });

    await waitFor(() => expect(renderCounts.current).toBe(3));
  });
});
