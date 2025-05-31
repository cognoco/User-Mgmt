import axios, { InternalAxiosRequestConfig } from 'axios';
import { clientConfig } from '@/core/config/client-config';

const { env } = clientConfig;
console.log('API URL:', env.apiBaseUrl);

// --- CSRF Token Handling ---
let csrfToken: string | null = null;
let csrfInitializationPromise: Promise<void> | null = null;
let csrfFetchStatus: 'idle' | 'pending' | 'success' | 'error' = 'idle';

// Function to fetch the CSRF token from the server
async function fetchAndStoreCsrfToken(): Promise<void> {
  if (typeof window === 'undefined') return;
  csrfFetchStatus = 'pending';
  console.log('[axios.ts] Setting status to PENDING. Attempting to fetch CSRF token...');
  try {
    const response = await fetch('/api/csrf');
    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (data.csrfToken) {
      csrfToken = data.csrfToken;
      csrfFetchStatus = 'success';
      console.log('[axios.ts] CSRF Token fetched and stored successfully. Status: SUCCESS');
    } else {
      throw new Error('CSRF token not found in response from /api/csrf');
    }
  } catch (error) {
    console.error('[axios.ts] Error fetching/storing CSRF token:', error);
    csrfToken = null; // Ensure token is null on failure
    csrfFetchStatus = 'error';
    console.log('[axios.ts] Status: ERROR');
    throw error; // Re-throw to indicate initialization failure
  }
}

// Export function to initialize CSRF token fetching
export function initializeCsrf(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }
  // Only start fetching if idle
  if (csrfFetchStatus === 'idle') {
    console.log('[axios.ts initializeCsrf] Status is IDLE, starting fetch...');
    csrfInitializationPromise = fetchAndStoreCsrfToken().catch(() => {
        // Catch ensures the promise resolves even on error,
        // preventing unhandled promise rejections if caller doesn't catch.
        // Status is already set to 'error' inside fetchAndStoreCsrfToken.
    });
    return csrfInitializationPromise;
  } else if (csrfFetchStatus === 'pending' && csrfInitializationPromise) {
    console.log('[axios.ts initializeCsrf] Status is PENDING, returning existing promise.');
    // If already pending, return the existing promise
    return csrfInitializationPromise;
  } else {
      console.log(`[axios.ts initializeCsrf] Status is ${csrfFetchStatus}, resolving immediately.`);
      // If success or error, resolve immediately
      return Promise.resolve();
  }
}

// --- Axios Instance Creation ---
export const api = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sending/receiving cookies
  timeout: env.apiTimeout,
});

// Request interceptor for adding auth token AND CSRF token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    
    // Add Auth Token (Bearer)
    const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    // Add CSRF Token header for mutating methods
    const method = config.method?.toUpperCase();
    if (method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      // If CSRF is pending, wait for it.
      if (csrfFetchStatus === 'pending' && csrfInitializationPromise) {
        console.log('[axios.ts Interceptor] Waiting for CSRF initialization before request...');
        try {
            await csrfInitializationPromise;
            console.log('[axios.ts Interceptor] CSRF initialization finished. Proceeding with request.');
        } catch (initError) {
            console.error('[axios.ts Interceptor] CSRF init failed, cancelling request.', initError);
            return Promise.reject(new Error('CSRF Initialization Failed'));
        }
      }
      
      // After potentially waiting, check status again
      if (csrfFetchStatus === 'success' && csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
        console.log('[axios.ts Interceptor] Attached X-CSRF-Token header.');
      } else {
        console.error(`[axios.ts Interceptor] CRITICAL: CSRF token missing or status (${csrfFetchStatus}) not 'success' for mutating request:`, config.url);
        return Promise.reject(new Error(`CSRF token is missing or invalid (status: ${csrfFetchStatus})`));
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    // Log all errors for debugging
    console.error('API error:', error.response?.status, error.response?.data);
    
    // Pass through the error for handling in components
    return Promise.reject(error);
  }
);

export default api;
