import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { useAuthStore } from '../../stores/auth.store';
import { AuthState, User, RegistrationPayload, LoginPayload, LoginResult } from '../../types/auth';
import { api } from '../../api/axios';
import { act } from '@testing-library/react';

// Mock the entire axios module used by the store
vi.mock('../../api/axios', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

// Use imported Mock type for assertion
const mockApiPost = api.post as Mock;
const mockApiDelete = api.delete as Mock;

describe('Auth Store', () => {

  const defaultInitialState = {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
    successMessage: null,
  };

  beforeEach(() => {
    vi.clearAllMocks(); // Clear mock calls
    useAuthStore.setState(defaultInitialState); // Reset state values by merging defaults (no replace=true)
    
    // Mock localStorage
    const localStorageMock = (() => {
        let store: Record<string, string> = {};
        return {
            getItem: vi.fn((key: string) => store[key] || null),
            setItem: vi.fn((key: string, value: string) => { store[key] = value.toString(); }),
            removeItem: vi.fn((key: string) => { delete store[key]; }),
            clear: vi.fn(() => { store = {}; })
        };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
  });

  afterEach(() => {
     vi.clearAllMocks();
     // Reset state again after test
     useAuthStore.setState(defaultInitialState);
  });

  it('should initialize with correct default values', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.user).toBeNull();
    expect(state.error).toBeNull();
    expect(state.successMessage).toBeNull();
  });

  // --- Login Tests --- 
  describe('login', () => {
    const loginCredentials: LoginPayload = { email: 'test@example.com', password: 'password' }; 
    const mockUser: User = {
      id: 'user-123', 
      email: 'test@example.com',
      user_metadata: { first_name: 'Test', last_name: 'User' }
    };
    const mockToken = 'mock-jwt-token';

    it('should set loading state during login', async () => {
      mockApiPost.mockResolvedValue({ data: { user: {}, token: 'token' } }); 
      
      const store = useAuthStore.getState();
      let loginPromise: Promise<LoginResult> | undefined;
      // Use act for state update triggering potential re-renders
      act(() => {
        loginPromise = store.login(loginCredentials); 
      });
      
      expect(useAuthStore.getState().isLoading).toBe(true);
      await loginPromise; 
      expect(useAuthStore.getState().isLoading).toBe(false); 
    });

    it('should set user, token, and authenticated state on successful login', async () => {
      mockApiPost.mockResolvedValue({ data: { user: mockUser, token: mockToken } });
      
      // Use act for state update
      await act(async () => {
        await useAuthStore.getState().login(loginCredentials);
      });
      
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.successMessage).toBeNull();
      expect(mockApiPost).toHaveBeenCalledWith('/api/auth/login', loginCredentials);
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', mockToken);
    });

    it('should set error state on failed login', async () => {
      const errorMessage = 'Invalid credentials';
      mockApiPost.mockRejectedValue({ response: { data: { error: errorMessage } } });

      // Use act for state update
      await act(async () => {
        await useAuthStore.getState().login(loginCredentials);
      });

      const state = useAuthStore.getState();
      expect(state.error).toBe(errorMessage);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  // --- Registration Tests --- 
  describe('register', () => {
    const registrationPayload: RegistrationPayload = {
        email: 'new@example.com',
        password: 'Password123',
        firstName: 'New',
        lastName: 'User'
    };
    const mockRegisteredUser: Partial<User> = { 
      id: 'new-user-456',
      email: 'new@example.com',
      user_metadata: { first_name: 'New', last_name: 'User' }
    };
    const successMsg = 'Registration successful. Please check your email.';

    it('should set loading state during registration', async () => {
      mockApiPost.mockReturnValue(new Promise(() => {})); 
      
      let registerPromise;
      act(() => {
        registerPromise = useAuthStore.getState().register(registrationPayload).catch(() => {});
      });

      expect(useAuthStore.getState().isLoading).toBe(true);
      expect(useAuthStore.getState().error).toBeNull();
      expect(useAuthStore.getState().successMessage).toBeNull();
    });

    it('should call API with correct payload and set state on successful registration', async () => {
      mockApiPost.mockResolvedValue({ data: { message: successMsg, user: mockRegisteredUser } });

      let result;
      await act(async () => {
        result = await useAuthStore.getState().register(registrationPayload);
      });

      const state = useAuthStore.getState();
      expect(mockApiPost).toHaveBeenCalledWith('/api/auth/register', registrationPayload); 
      expect(state.isLoading).toBe(false);
      expect(state.user).toEqual(mockRegisteredUser);
      expect(state.isAuthenticated).toBe(false); 
      expect(state.successMessage).toBe(successMsg);
      expect(state.error).toBeNull();
      expect(result).toEqual({ success: true, message: successMsg });
      expect(localStorage.setItem).not.toHaveBeenCalled(); 
    });

    it('should set error state and return error on failed registration (e.g., email exists)', async () => {
      const errorResponse = { response: { data: { error: 'Email already exists' } } };
      mockApiPost.mockRejectedValue(errorResponse);

      let result;
      await act(async () => {
        result = await useAuthStore.getState().register(registrationPayload);
      });

      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.successMessage).toBeNull();
      expect(state.error).toBe('Email already exists');
      expect(result).toEqual({ success: false, error: 'Email already exists' });
    });
  });

  // --- Logout Tests --- 
  describe('logout', () => {
     it('should clear user, token, and authenticated state on logout', async () => {
      const initialUser: User = { id: 'user-123', email: 'test@example.com' };
      act(() => {
        useAuthStore.setState({ user: initialUser, isAuthenticated: true });
      });
      localStorage.setItem('auth_token', 'mock-token');
      mockApiPost.mockResolvedValue({});

      await act(async () => {
        await useAuthStore.getState().logout();
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.successMessage).toBeNull(); 
      expect(mockApiPost).toHaveBeenCalledWith('/api/auth/logout');
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
    });

     it('should set error on failed logout', async () => {
         const errorResponse = { response: { data: { error: 'Logout API failed' } } };
         mockApiPost.mockRejectedValue(errorResponse);

         await act(async () => {
             await useAuthStore.getState().logout();
         });

         const state = useAuthStore.getState();
         expect(state.isLoading).toBe(false);
         expect(state.error).toBe('Logout API failed');
     });
  });
  
  // --- ClearError Tests --- 
  describe('clearError', () => {
    it('should clear the error message', () => {
      act(() => {
        useAuthStore.setState({ error: 'An error occurred' });
      });
      expect(useAuthStore.getState().error).toBe('An error occurred');

      act(() => {
        useAuthStore.getState().clearError();
      });
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  // --- ClearSuccessMessage Tests --- 
  describe('clearSuccessMessage', () => {
    it('should clear the success message', () => {
      act(() => {
        useAuthStore.setState({ successMessage: 'Operation successful' });
      });
      expect(useAuthStore.getState().successMessage).toBe('Operation successful');

      act(() => {
        useAuthStore.getState().clearSuccessMessage();
      });
      expect(useAuthStore.getState().successMessage).toBeNull();
    });
  });

  // --- DeleteAccount Tests --- 
  describe('deleteAccount', () => {
    const initialUser: User = { id: 'user-123', email: 'test@example.com' };
    let originalLocation: Location;

    beforeEach(() => {
      originalLocation = window.location;
      //@ts-ignore
      delete window.location;
      window.location = { href: '', assign: vi.fn(), replace: vi.fn() } as unknown as Location;
      act(() => {
        useAuthStore.setState({ user: initialUser, isAuthenticated: true });
      });
      localStorage.setItem('auth_token', 'mock-token');
      mockApiDelete.mockResolvedValue({});
    });

    afterEach(() => {
      window.location = originalLocation;
    });

    it('should call delete endpoint and clear state on success (no password)', async () => {
      await act(async () => {
        await useAuthStore.getState().deleteAccount();
      });

      const state = useAuthStore.getState();
      expect(mockApiDelete).toHaveBeenCalledWith('/api/auth/account', { data: undefined });
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
    });

    it('should call delete endpoint with password and clear state on success', async () => {
      const password = 'password123';
      await act(async () => {
        await useAuthStore.getState().deleteAccount(password);
      });

      const state = useAuthStore.getState();
      expect(mockApiDelete).toHaveBeenCalledWith('/api/auth/account', { data: { password } });
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
    });

    it('should set error on failed delete', async () => {
      const errorResponse = { response: { data: { error: 'Delete failed' } } };
      mockApiDelete.mockRejectedValue(errorResponse);

      await act(async () => {
        await useAuthStore.getState().deleteAccount();
      });

      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Delete failed');
      expect(state.user).not.toBeNull();
      expect(state.isAuthenticated).toBe(true);
    });
  });

});
