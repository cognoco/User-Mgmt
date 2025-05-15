interface ConnectedAccountsStoreMockState {
  accounts: any[];
  isLoading: boolean;
  error: any;
  fetchConnectedAccounts: () => Promise<void>;
  connectAccount: (provider: any) => Promise<void>;
  disconnectAccount: (accountId: string) => Promise<void>;
  clearError: () => void;
  [key: string]: any;
}

export function createConnectedAccountsStoreMock(overrides = {}) {
  let state: ConnectedAccountsStoreMockState = {
    accounts: [],
    isLoading: false,
    error: null,
    fetchConnectedAccounts: vi.fn(async () => {}),
    connectAccount: vi.fn(async () => {}),
    disconnectAccount: vi.fn(async () => {}),
    clearError: vi.fn(() => { state.error = null; }),
    ...overrides,
  };
  const subscribers = new Set<(state: ConnectedAccountsStoreMockState) => void>();
  const getState = () => state;
  const setState = (partial: Partial<ConnectedAccountsStoreMockState> | ((state: ConnectedAccountsStoreMockState) => Partial<ConnectedAccountsStoreMockState>)) => {
    state = { ...state, ...(typeof partial === 'function' ? partial(state) : partial) };
    subscribers.forEach((cb) => cb(state));
  };
  const subscribe = (cb: (state: ConnectedAccountsStoreMockState) => void) => {
    subscribers.add(cb);
    return () => subscribers.delete(cb);
  };
  const destroy = () => subscribers.clear();
  return { ...state, getState, setState, subscribe, destroy };
} 