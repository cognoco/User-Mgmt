/**
 * Application Initialization
 * 
 * This file initializes the application by configuring all necessary services
 * and adapters according to the architecture guidelines.
 */

import { UserManagementConfiguration } from '@/core/config';
import { createSupabaseClient } from '@/lib/database/supabase';
import { api } from '@/lib/api/axios';
import { createSupabaseWebhookProvider } from '@/adapters/webhooks';
import { createWebhookService } from '@/services/webhooks';

// Initialize the application
export function initializeApp() {
  try {
    console.log('Initializing application...');
    
    // Create Supabase client
    const supabaseClient = createSupabaseClient();
    
    // Register service providers
    UserManagementConfiguration.configureServiceProviders({
      // Auth service
      authService: {
        login: async (credentials) => {
          console.log('Login attempt:', credentials.email);
          try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password,
            });
            
            if (error) {
              console.error('Login error:', error.message);
              return { success: false, error: error.message };
            }
            
            return { 
              success: true, 
              user: {
                id: data.user?.id,
                email: data.user?.email,
                firstName: data.user?.user_metadata?.firstName,
                lastName: data.user?.user_metadata?.lastName,
                metadata: data.user?.user_metadata
              }
            };
          } catch (error) {
            console.error('Login exception:', error);
            return { success: false, error: 'Authentication failed' };
          }
        },
        
        register: async (userData) => {
          console.log('Registration attempt:', userData.email);
          try {
            const { data, error } = await supabaseClient.auth.signUp({
              email: userData.email,
              password: userData.password,
              options: {
                data: {
                  firstName: userData.firstName,
                  lastName: userData.lastName,
                  ...userData.metadata
                }
              }
            });
            
            if (error) {
              console.error('Registration error:', error.message);
              return { success: false, error: error.message };
            }
            
            return { 
              success: true,
              user: {
                id: data.user?.id,
                email: data.user?.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                metadata: userData.metadata
              }
            };
          } catch (error) {
            console.error('Registration exception:', error);
            return { success: false, error: 'Registration failed' };
          }
        },
        
        logout: async () => {
          console.log('Logout attempt');
          try {
            const { error } = await supabaseClient.auth.signOut();
            
            if (error) {
              console.error('Logout error:', error.message);
              return { success: false, error: error.message };
            }
            
            return { success: true };
          } catch (error) {
            console.error('Logout exception:', error);
            return { success: false, error: 'Logout failed' };
          }
        },
        
        resetPassword: async (email) => {
          console.log('Password reset attempt:', email);
          try {
            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/reset-password`,
            });
            
            if (error) {
              console.error('Password reset error:', error.message);
              return { success: false, error: error.message };
            }
            
            return { 
              success: true, 
              message: 'Password reset instructions sent to your email' 
            };
          } catch (error) {
            console.error('Password reset exception:', error);
            return { success: false, error: 'Password reset failed' };
          }
        },
        
        getCurrentUser: () => {
          // This is a synchronous method, so we can't use async/await
          // We'll return null and let the auth state listener handle user state
          return null;
        },
        
        isAuthenticated: () => {
          // This is a synchronous method, so we can't use async/await
          // We'll return false and let the auth state listener handle auth state
          return false;
        },
        
        onAuthStateChanged: (callback) => {
          // Set up auth state listener
          const { data } = supabaseClient.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
              const user = {
                id: session.user.id,
                email: session.user.email,
                firstName: session.user.user_metadata?.firstName,
                lastName: session.user.user_metadata?.lastName,
                metadata: session.user.user_metadata
              };
              callback(user);
            } else {
              callback(null);
            }
          });
          
          // Return unsubscribe function
          return () => {
            data.subscription.unsubscribe();
          };
        }
      },
      
      // Add minimal implementations for other required services
      userService: {
        getUserProfile: async () => ({ success: true, profile: {} }),
        updateUserProfile: async () => ({ success: true }),
        deleteUserAccount: async () => ({ success: true }),
      },
      
      teamService: {
        getTeams: async () => ({ success: true, teams: [] }),
        createTeam: async () => ({ success: true, team: {} }),
        updateTeam: async () => ({ success: true }),
        deleteTeam: async () => ({ success: true }),
      },
      
      permissionService: {
        getRoles: async () => ({ success: true, roles: [] }),
        getPermissions: async () => ({ success: true, permissions: [] }),
        assignRole: async () => ({ success: true }),
        revokeRole: async () => ({ success: true }),
      },

      webhookService: createWebhookService({
        apiClient: api,
        webhookDataProvider: createSupabaseWebhookProvider({
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        })
      })
    });
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
}

// Export a default function for easier imports
export default initializeApp;
