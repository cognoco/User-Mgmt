import { CompanyProfile, CompanyAddress, AddressType } from '@/types/company';

interface CompanyProfileStoreMockState {
  profile: any;
  addresses: any[];
  isLoading: boolean;
  error: any;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  addAddress: (address: any) => Promise<void>;
  updateAddress: (id: string, data: any) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  [key: string]: any;
}

export function createCompanyProfileStoreMock(overrides = {}) {
  let state: CompanyProfileStoreMockState = {
    profile: null,
    addresses: [],
    isLoading: false,
    error: null,
    fetchProfile: vi.fn(async () => {}),
    updateProfile: vi.fn(async () => {}),
    addAddress: vi.fn(async () => {}),
    updateAddress: vi.fn(async () => {}),
    deleteAddress: vi.fn(async () => {}),
    ...overrides,
  };
  const subscribers = new Set<(state: CompanyProfileStoreMockState) => void>();
  const getState = () => state;
  const setState = (partial: Partial<CompanyProfileStoreMockState> | ((state: CompanyProfileStoreMockState) => Partial<CompanyProfileStoreMockState>)) => {
    state = { ...state, ...(typeof partial === 'function' ? partial(state) : partial) };
    subscribers.forEach((cb) => cb(state));
  };
  const subscribe = (cb: (state: CompanyProfileStoreMockState) => void) => {
    subscribers.add(cb);
    return () => subscribers.delete(cb);
  };
  const destroy = () => subscribers.clear();
  return { ...state, getState, setState, subscribe, destroy };
} 