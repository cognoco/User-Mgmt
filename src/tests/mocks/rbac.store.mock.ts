type RBACStoreMockState = {
  roles: any[];
  userRoles: any[];
  isLoading: boolean;
  error: any;
  fetchRoles: () => Promise<void>;
  fetchUserRoles: (userId: string) => Promise<void>;
  assignRole: (userId: string, roleId: string) => Promise<void>;
  removeRole: (userId: string, roleId: string) => Promise<void>;
  hasPermission: (permission: any) => boolean;
  hasRole: (role: any) => boolean;
  clearError: () => void;
  [key: string]: any;
};

export function createRBACStoreMock(overrides = {}) {
  let state: RBACStoreMockState = {
    roles: [],
    userRoles: [],
    isLoading: false,
    error: null,
    fetchRoles: vi.fn(async () => {}),
    fetchUserRoles: vi.fn(async () => {}),
    assignRole: vi.fn(async () => {}),
    removeRole: vi.fn(async () => {}),
    hasPermission: vi.fn(() => false),
    hasRole: vi.fn(() => false),
    clearError: vi.fn(() => { state.error = null; }),
    ...overrides,
  };
  const subscribers = new Set<(state: RBACStoreMockState) => void>();
  const getState = () => state;
  const setState = (partial: Partial<RBACStoreMockState> | ((state: RBACStoreMockState) => Partial<RBACStoreMockState>)) => {
    state = { ...state, ...(typeof partial === 'function' ? partial(state) : partial) };
    subscribers.forEach((cb) => cb(state));
  };
  const subscribe = (cb: (state: RBACStoreMockState) => void) => {
    subscribers.add(cb);
    return () => subscribers.delete(cb);
  };
  const destroy = () => subscribers.clear();
  return { ...state, getState, setState, subscribe, destroy };
} 