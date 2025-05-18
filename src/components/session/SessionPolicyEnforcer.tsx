import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/axios';
import { useAuthStore } from '@/lib/stores/auth.store';

interface SessionPolicyEnforcerProps {
  intervalMs?: number; // How often to call the API
  children?: React.ReactNode;
}

/**
 * Component that periodically enforces session policies
 * This helps ensure session timeouts and max sessions are enforced client-side
 */
export const SessionPolicyEnforcer: React.FC<SessionPolicyEnforcerProps> = ({
  intervalMs = 5 * 60 * 1000, // Default: 5 minutes
  children,
}) => {
  const enforceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();

  // Function to call the policy enforcement API
  const enforceSessionPolicies = async () => {
    if (!isAuthenticated) return;

    try {
      await api.post('/api/session/enforce-policies');
    } catch (error: any) {
      console.error('Error enforcing session policies:', error);
      
      // If unauthorized (session expired/invalid), logout
      if (error.response?.status === 401) {
        logout();
        router.push('/login?reason=session_expired');
      }
    }
  };

  useEffect(() => {
    // Enforce on mount
    enforceSessionPolicies();
    
    // Set up interval for regular enforcement
    enforceIntervalRef.current = setInterval(enforceSessionPolicies, intervalMs);
    
    // Activity tracking (optional) - update last activity when user is active
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    const handleActivity = () => {
      enforceSessionPolicies();
    };
    
    // Add event listeners for user activity
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      // Clean up interval and event listeners
      if (enforceIntervalRef.current) {
        clearInterval(enforceIntervalRef.current);
      }
      
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, intervalMs]);

  // Just render children, this component only adds behavior
  return <>{children}</>;
}; 