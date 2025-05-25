"use client";

import React, { useEffect, useState } from "react";
import {
  UserManagementProvider,
  UserManagementConfig,
  IntegrationCallbacks,
} from "./UserManagementProvider";
import { initializeCsrf } from "@/lib/api/axios";
import { supabase } from "@/lib/database/supabase";
import { UserManagementConfiguration } from "@/core/config";
import { AuthService } from "@/core/auth/interfaces";
import { User } from "@/core/auth/models";
import toast, { Toaster } from "react-hot-toast";
import { OAuthProvider } from "@/types/oauth";
import { SessionPolicyEnforcer } from "@/ui/styled/session/SessionPolicyEnforcer";
import { diagnoseInitializationIssues, registerAllServices } from "@/scripts/fix-initialization";

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
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        redirectUri:
          process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
          (typeof window !== "undefined"
            ? window.location.origin + "/auth/callback"
            : ""),
      },
      {
        enabled: true,
        provider: OAuthProvider.APPLE,
        clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || "",
        redirectUri:
          process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI ||
          (typeof window !== "undefined"
            ? window.location.origin + "/auth/callback"
            : ""),
      },
      {
        enabled: true,
        provider: OAuthProvider.GITHUB,
        clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "",
        redirectUri:
          process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI ||
          (typeof window !== "undefined"
            ? window.location.origin + "/auth/callback"
            : ""),
      },
    ],
    autoLink: true,
    allowUnverifiedEmails: false,
    defaultRedirectPath: "/",
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

export function UserManagementClientBoundary({
  children,
}: UserManagementClientBoundaryProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize the application and services on mount
  useEffect(() => {
    console.log("[UserManagementClientBoundary] Initializing application...");
    
    try {
      // Check if services are properly registered
      const servicesRegistered = diagnoseInitializationIssues();
      
      if (!servicesRegistered) {
        console.log("[UserManagementClientBoundary] Attempting to register services manually...");
        registerAllServices();
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error("[UserManagementClientBoundary] Initialization failed:", error);
      setInitError(error instanceof Error ? error.message : 'Unknown initialization error');
    }
  }, []);
  
  // Initialize CSRF token fetching on mount
  useEffect(() => {
    console.log(
      ">>>>>>>>>> [UserManagementClientBoundary] useEffect CSRF RUNNING <<<<<<<<<<",
    );
    console.log("[UserManagementClientBoundary] Initializing CSRF...");
    initializeCsrf()
      .then(() => {
        console.log(
          "[UserManagementClientBoundary] CSRF initialization successful (or already done).",
        );
      })
      .catch((error) => {
        console.error(
          "[UserManagementClientBoundary] CSRF initialization failed:",
          error,
        );
      });
  }, []);

  // Setup Supabase auth listener
  useEffect(() => {
    console.log(
      ">>>>>>>>>> [UserManagementClientBoundary] useEffect Supabase Listener RUNNING <<<<<<<<<<",
    );

    // Get the auth service from the service provider registry
    const authService =
      UserManagementConfiguration.getServiceProvider<AuthService>(
        "authService",
      );

    if (!authService) {
      console.error(
        "[UserManagementClientBoundary] AuthService is not registered in the service provider registry. Attempting to initialize...",
      );
      
      // Try to initialize the application if the service is not found
      try {
        const { initializeApp } = require('@/core/initialization/app-init');
        const services = initializeApp();
        
        // Register services with UserManagementConfiguration
        UserManagementConfiguration.configureServiceProviders({
          authService: services.authService,
          userService: services.userService,
          teamService: services.teamService,
          permissionService: services.permissionService,
          webhookService: services.webhookService
        });
        
        console.log("[UserManagementClientBoundary] Successfully initialized application and registered services");
      } catch (initError) {
        console.error("[UserManagementClientBoundary] Failed to initialize application:", initError);
        return;
      }
    }

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log(
        "[UserManagementClientBoundary] Initial session check:",
        session,
      );
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
        authService.setCurrentUser(localUser);
        authService.setAuthToken(session.access_token ?? null);
      } else {
        authService.setCurrentUser(null);
        authService.setAuthToken(null);
      }
    });

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "[UserManagementClientBoundary] Auth state change:",
        event,
        session,
      );
      const previousUser = await authService.getCurrentUser();

      if (session?.user && session.user.email) {
        const localUser: User = {
          id: session.user.id,
          email: session.user.email,
          app_metadata: session.user.app_metadata,
          user_metadata: session.user.user_metadata,
        };
        authService.setCurrentUser(localUser);
        authService.setAuthToken(session.access_token ?? null);

        if (event === "SIGNED_IN" && !previousUser) {
          const isConfirmed =
            session.user.email_confirmed_at ||
            (session.user.user_metadata as any)?.email_verified;

          if (isConfirmed) {
            console.log(
              "[UserManagementClientBoundary] Detected likely post-verification SIGNED_IN event.",
            );
            setTimeout(() => {
              toast.success(
                "Email successfully verified! You are now logged in.",
                { duration: 4000 },
              );
            }, 500);
          } else {
            console.log(
              "[UserManagementClientBoundary] SIGNED_IN event, but email not confirmed yet.",
            );
          }
          clientCallbacks.onUserLogin(localUser);
        }
      } else {
        if (previousUser) {
          authService.setCurrentUser(null);
          authService.setAuthToken(null);
          clientCallbacks.onUserLogout();
        } else {
          authService.setCurrentUser(null);
          authService.setAuthToken(null);
        }
      }
    });

    // Cleanup listener on unmount
    return () => {
      console.log(
        "[UserManagementClientBoundary] Unsubscribing from auth state changes.",
      );
      subscription?.unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Show initialization error if there is one
  if (initError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="p-6 max-w-md bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Initialization Error</h1>
          <p className="text-gray-700 mb-4">
            The application failed to initialize properly. Please check the console for more details.
          </p>
          <div className="p-3 bg-red-50 rounded text-sm text-red-800 font-mono overflow-auto">
            {initError}
          </div>
        </div>
      </div>
    );
  }
  
  // Show loading indicator while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Check if all required services are registered before rendering
  const authService = UserManagementConfiguration.getServiceProvider<AuthService>("authService");
  
  if (!authService) {
    // Still no auth service after initialization attempt
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="p-6 max-w-md bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Service Initialization Error</h1>
          <p className="text-gray-700 mb-4">
            The application failed to initialize required services. Please check the console for more details.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <UserManagementProvider config={clientConfig}>
      <Toaster position="top-center" reverseOrder={false} />
      <SessionPolicyEnforcer>{children}</SessionPolicyEnforcer>
    </UserManagementProvider>
  );
}
