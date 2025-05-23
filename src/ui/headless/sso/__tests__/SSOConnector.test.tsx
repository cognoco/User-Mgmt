// @vitest-environment jsdom
import { render, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SSOConnector } from '../SSOConnector';
import { useSso } from '@/hooks/sso/useSso';

vi.mock('@/hooks/sso/useSso', () => ({ useSso: vi.fn() }));
const mockUseSso = useSso as unknown as ReturnType<typeof vi.fn>;
let state: any;

describe('SSOConnector', () => {
  beforeEach(() => {
    state = {
      providers: [],
      connectedProviders: [],
      loading: false,
      error: null,
      fetchProviders: vi.fn(),
      fetchConnections: vi.fn(),
      connectProvider: vi.fn(async () => undefined),
      disconnectProvider: vi.fn(async () => undefined),
    };
    mockUseSso.mockReturnValue(state);
  });

  it('fetches providers and connections on mount', () => {
    render(<SSOConnector>{() => null}</SSOConnector>);
    expect(state.fetchProviders).toHaveBeenCalled();
    expect(state.fetchConnections).toHaveBeenCalled();
  });

  it('calls connectProvider', async () => {
    let props: any;
    render(<SSOConnector>{p => { props = p; return null; }}</SSOConnector>);
    await act(async () => {
      await props.connect('google');
    });
    expect(state.connectProvider).toHaveBeenCalledWith('google');
  });

  it('calls disconnectProvider', async () => {
    let props: any;
    render(<SSOConnector>{p => { props = p; return null; }}</SSOConnector>);
    await act(async () => {
      await props.disconnect('conn1');
    });
    expect(state.disconnectProvider).toHaveBeenCalledWith('conn1');
  });
});
