import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeatureFlagsPanel } from '../FeatureFlagsPanel';
import * as config from '@/core/config';

vi.mock('@/core/config', async () => {
  const actual = await vi.importActual<typeof config>('@/core/config');
  return {
    ...actual,
    configureFeatures: vi.fn(actual.configureFeatures),
  };
});

describe('FeatureFlagsPanel', () => {
  beforeEach(() => {
    config.resetConfiguration();
    vi.clearAllMocks();
  });

  it('renders switches for each feature and toggles them', async () => {
    render(<FeatureFlagsPanel />);
    const flags = config.getConfiguration().featureFlags;
    const firstKey = Object.keys(flags)[0] as keyof typeof flags;
    const toggle = screen.getByLabelText(firstKey);
    await userEvent.click(toggle);
    expect((config.configureFeatures as any)).toHaveBeenCalled();
  });
});
