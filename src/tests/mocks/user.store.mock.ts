interface UserStoreMockState {
  profile: any;
  settings: any;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: any) => Promise<void>;
  updateSettings: (data: any) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  fetchProfile: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  fetchUserAuditLogs: (filters: any) => Promise<any>;
  exportUserAuditLogs: (filters: any) => Promise<Blob>;
  [key: string]: any;
}

export function createUserStoreMock(overrides = {}) {
  let state: UserStoreMockState = {
    profile: null,
    settings: null,
    isLoading: false,
    error: null,
    updateProfile: vi.fn(async () => {}),
    updateSettings: vi.fn(async () => {}),
    uploadAvatar: vi.fn(async () => ''),
    fetchProfile: vi.fn(async () => {}),
    fetchSettings: vi.fn(async () => {}),
    fetchUserAuditLogs: vi.fn(async () => ({ logs: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } })),
    exportUserAuditLogs: vi.fn(async () => new Blob()),
    ...overrides,
  };
  const subscribers = new Set<(state: UserStoreMockState) => void>();
  const getState = () => state;
  const setState = (partial: Partial<UserStoreMockState> | ((state: UserStoreMockState) => Partial<UserStoreMockState>)) => {
    state = { ...state, ...(typeof partial === 'function' ? partial(state) : partial) };
    subscribers.forEach((cb) => cb(state));
  };
  const subscribe = (cb: (state: UserStoreMockState) => void) => {
    subscribers.add(cb);
    return () => subscribers.delete(cb);
  };
  const destroy = () => subscribers.clear();
  return { ...state, getState, setState, subscribe, destroy };
}

export default createUserStoreMock; 