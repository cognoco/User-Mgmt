type OAuthStoreMockState = {
  isLoading: boolean;
  error: any;
  connectedProviders: any[];
  login: (provider: any) => void;
  handleCallback: (provider: any, code: string) => Promise<void>;
  disconnect: (provider: any) => Promise<void>;
  isConnected: (provider: any) => boolean;
  clearError: () => void;
  [key: string]: any;
};

export function createOAuthStoreMock(overrides = {}) {
  let state: OAuthStoreMockState = {
    isLoading: false,
    error: null,
    connectedProviders: [],
    login: vi.fn(() => {}),
    handleCallback: vi.fn(async () => {}),
    disconnect: vi.fn(async () => {}),
    isConnected: vi.fn(() => false),
    clearError: vi.fn(() => { state.error = null; }),
    ...overrides,
  };
  const subscribers = new Set<(state: OAuthStoreMockState) => void>();
  const getState = () => state;
  const setState = (partial: Partial<OAuthStoreMockState> | ((state: OAuthStoreMockState) => Partial<OAuthStoreMockState>)) => {
    state = { ...state, ...(typeof partial === 'function' ? partial(state) : partial) };
    subscribers.forEach((cb) => cb(state));
  };
  const subscribe = (cb: (state: OAuthStoreMockState) => void) => {
    subscribers.add(cb);
    return () => subscribers.delete(cb);
  };
  const destroy = () => subscribers.clear();
  return { ...state, getState, setState, subscribe, destroy };
} 