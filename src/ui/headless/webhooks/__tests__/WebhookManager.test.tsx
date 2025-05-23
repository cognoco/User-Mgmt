// @vitest-environment jsdom
import { render, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebhookManager } from '../WebhookManager';
import { useWebhooks } from '@/hooks/webhooks/use-webhooks';

vi.mock('@/hooks/webhooks/use-webhooks', () => ({ useWebhooks: vi.fn() }));
const mockUseWebhooks = useWebhooks as unknown as ReturnType<typeof vi.fn>;
let state: any;

describe('WebhookManager', () => {
  beforeEach(() => {
    state = {
      webhooks: [],
      loading: false,
      error: null,
      fetchWebhooks: vi.fn(),
      createWebhook: vi.fn(async () => ({ success: true })),
      updateWebhook: vi.fn(async () => ({ success: true })),
      deleteWebhook: vi.fn(async () => ({ success: true })),
    };
    mockUseWebhooks.mockReturnValue(state);
  });

  it('fetches webhooks on mount', () => {
    render(<WebhookManager userId="u1">{() => null}</WebhookManager>);
    expect(state.fetchWebhooks).toHaveBeenCalled();
  });

  it('calls createWebhook', async () => {
    let props: any;
    render(<WebhookManager userId="u1">{p => { props = p; return null; }}</WebhookManager>);
    await act(async () => {
      await props.create({ name: 'n', url: 'u', events: [] });
    });
    expect(state.createWebhook).toHaveBeenCalled();
  });

  it('calls deleteWebhook', async () => {
    let props: any;
    render(<WebhookManager userId="u1">{p => { props = p; return null; }}</WebhookManager>);
    await act(async () => {
      await props.remove('id1');
    });
    expect(state.deleteWebhook).toHaveBeenCalledWith('id1');
  });
});
