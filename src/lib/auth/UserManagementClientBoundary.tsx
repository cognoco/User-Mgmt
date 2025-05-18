'use client';

import React, { useEffect } from 'react';
import { UserManagementProvider, UserManagementConfig, IntegrationCallbacks } from './UserManagementProvider';
import { initializeCsrf } from '@/lib/api/axios';
import { supabase } from '@/lib/database/supabase';
import { useAuthStore } from '@/lib/stores/auth.store';
import { User } from '@/types/auth';
import toast, { Toaster } from 'react-hot-toast';
import { OAuthProvider } from '@/types/oauth';
import { SessionPolicyEnforcer } from '@/components/session/SessionPolicyEnforcer';

// Define the callbacks inside the Client Component
const clientCallbacks: Required<IntegrationCallbacks> = {
  onUserLogin: (user) => {
    console.log("Client Boundary: User logged in:", user);
  },
  onUserLogout: () => {
    console.log("Client Boundary: User logged out");
  },
  onProfileUpdate: (profile) => {
    console.log("Client Boundary: Profile updated:", profile);
  },
  onError: (error) => {
    console.error("Client Boundary: Error in user management:", error);
  },
};

// Construct the config within the Client Component
// Read necessary environment variables available client-side
const clientConfig: UserManagementConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL, // Read client-safe env var
  storageKeyPrefix: "user-mgmt", // Or read from env if needed
  callbacks: clientCallbacks,
  oauth: {
    enabled: true,
    providers: [
      {
        enabled: true,
        provider: OAuthProvider.GOOGLE,
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || (typeof window !== 'undefined' ? window.location.origin + '/auth/callback' : ''),
      },
      {
        enabled: true,
        provider: OAuthProvider.APPLE,
        clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || '',
        redirectUri: process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI || (typeof window !== 'undefined' ? window.location.origin + '/auth/callback' : ''),
      },
      {
        enabled: true,
        provider: OAuthProvider.GITHUB,
        clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
        redirectUri: process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI || (typeof window !== 'undefined' ? window.location.origin + '/auth/callback' : ''),
      },
    ],
    autoLink: true,
    allowUnverifiedEmails: false,
    defaultRedirectPath: '/',
  },
  // Add other config defaults from UserManagementProvider if they weren't passed from layout
  // Example: (ensure these match defaults in UserManagementProvider or pass props)
  // twoFactor: { enabled: false, methods: [], required: false },
  // subscription: { enabled: false, defaultTier: 'FREE', features: {}, enableBilling: false },
  // corporateUsers: { enabled: false, registrationEnabled: true, requireCompanyValidation: false, allowUserTypeChange: false, companyFieldsRequired: ['name'], defaultUserType: 'PRIVATE' },
};

interface UserManagementClientBoundaryProps {
    children: React.ReactNode;
}

export function UserManagementClientBoundary({ children }: UserManagementClientBoundaryProps) {
  
  // Initialize CSRF token fetching on mount
  useEffect(() => {
    console.log('>>>>>>>>>> [UserManagementClientBoundary] useEffect CSRF RUNNING <<<<<<<<<<'); 
    console.log('[UserManagementClientBoundary] Initializing CSRF...');
    initializeCsrf()
      .then(() => {
        console.log('[UserManagementClientBoundary] CSRF initialization successful (or already done).');
      })
      .catch(error => {
        console.error('[UserManagementClientBoundary] CSRF initialization failed:', error);
      });
  }, []); 

  // Setup Supabase auth listener
  useEffect(() => {
    console.log('>>>>>>>>>> [UserManagementClientBoundary] useEffect Supabase Listener RUNNING <<<<<<<<<<');
    const { setUser, setToken } = useAuthStore.getState();

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[UserManagementClientBoundary] Initial session check:', session);
      // Check for user and email before setting
      if (session?.user && session.user.email) {
        // Create object conforming to local User type
        const localUser: User = {
          id: session.user.id,
          email: session.user.email, // Known to be string here
          app_metadata: session.user.app_metadata,
          user_metadata: session.user.user_metadata,
          // Add other fields from session.user if needed by local User type
        };
        setUser(localUser);
        setToken(session.access_token ?? null);
      } else {
        setUser(null);
        setToken(null);
      }
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[UserManagementClientBoundary] Auth state change:', event, session);
      const previousUser = useAuthStore.getState().user;
      
      if (session?.user && session.user.email) {
        const localUser: User = {
          id: session.user.id,
          email: session.user.email, 
          app_metadata: session.user.app_metadata,
          user_metadata: session.user.user_metadata,
        };
        setUser(localUser);
        setToken(session.access_token ?? null);

        if (event === 'SIGNED_IN' && !previousUser) {
            const isConfirmed = session.user.email_confirmed_at || (session.user.user_metadata as any)?.email_verified;

            if (isConfirmed) {
                 console.log('[UserManagementClientBoundary] Detected likely post-verification SIGNED_IN event.');
                 setTimeout(() => {
                    toast.success('Email successfully verified! You are now logged in.', { duration: 4000 });
                 }, 500);
            } else {
                 console.log('[UserManagementClientBoundary] SIGNED_IN event, but email not confirmed yet.');
            }
             clientCallbacks.onUserLogin(localUser);
        }

      } else {
        if (previousUser) {
           setUser(null);
           setToken(null);
           clientCallbacks.onUserLogout();
        } else {
           setUser(null);
           setToken(null);
        }
      }
    });

    // Cleanup listener on unmount
    return () => {
      console.log('[UserManagementClientBoundary] Unsubscribing from auth state changes.');
      subscription?.unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <UserManagementProvider config={clientConfig}>
      <Toaster position="top-center" reverseOrder={false} />
      <SessionPolicyEnforcer>
        {children}
      </SessionPolicyEnforcer>
    </UserManagementProvider>
  );
} 