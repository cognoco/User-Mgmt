interface TwoFAStoreMockState {
  config: any;
  isLoading: boolean;
  error: any;
  setup2FA: (method: any) => Promise<void>;
  verify2FA: (verification: any) => Promise<void>;
  disable2FA: () => Promise<void>;
  generateBackupCodes: () => Promise<string[]>;
  clearError: () => void;
  [key: string]: any;
}

export function create2FAStoreMock(overrides = {}) {
  let state: TwoFAStoreMockState = {
    config: { enabled: false, methods: [], required: false },
    isLoading: false,
    error: null,
    setup2FA: vi.fn(async () => {}),
    verify2FA: vi.fn(async () => {}),
    disable2FA: vi.fn(async () => {}),
    generateBackupCodes: vi.fn(async () => []),
    clearError: vi.fn(() => { state.error = null; }),
    ...overrides,
  };
  const subscribers = new Set<(state: TwoFAStoreMockState) => void>();
  const getState = () => state;
  const setState = (partial: Partial<TwoFAStoreMockState> | ((state: TwoFAStoreMockState) => Partial<TwoFAStoreMockState>)) => {
    state = { ...state, ...(typeof partial === 'function' ? partial(state) : partial) };
    subscribers.forEach((cb) => cb(state));
  };
  const subscribe = (cb: (state: TwoFAStoreMockState) => void) => {
    subscribers.add(cb);
    return () => subscribers.delete(cb);
  };
  const destroy = () => subscribers.clear();
  return { ...state, getState, setState, subscribe, destroy };
} 