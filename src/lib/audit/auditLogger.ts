import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/database'; // Corrected import path

// Define the structure for the log entry details
// Ensure this ONLY ever contains non-sensitive information curated specifically for the audit log.
export interface AuditLogDetails {
  [key: string]: unknown; // Allow flexible, non-sensitive details
}

// Define the parameters for the logUserAction function
export interface LogUserActionParams {
  userId?: string | null; // Nullable for system actions or unauthenticated attempts
  action: string; // e.g., 'LOGIN_SUCCESS', 'PROFILE_UPDATE'
  status: 'SUCCESS' | 'FAILURE' | 'INITIATED' | 'COMPLETED';
  ipAddress?: string | null;
  userAgent?: string | null;
  targetResourceType?: string | null;
  targetResourceId?: string | null;
  details?: AuditLogDetails | null;
  client?: SupabaseClient; // Optional: allow passing a specific Supabase client (e.g., service role)
}

/**
 * Logs a significant user or system action to the user_actions_log table.
 * IMPORTANT: Ensure that the 'details' object is sanitized and contains
 * ONLY non-sensitive information BEFORE calling this function.
 *
 * @param params - The parameters for the log entry.
 */
export async function logUserAction(params: LogUserActionParams): Promise<void> {
  const { 
    userId, 
    action, 
    status, 
    ipAddress, 
    userAgent, 
    targetResourceType, 
    targetResourceId, 
    details, 
    client = supabase // Use default client if none provided
  } = params;

  try {
    const { error } = await client
      .from('user_actions_log')
      .insert({
        user_id: userId,
        action: action,
        status: status,
        ip_address: ipAddress, // Assumes INET type in DB can handle string representation
        user_agent: userAgent,
        target_resource_type: targetResourceType,
        target_resource_id: targetResourceId,
        details: details ?? {},
      });

    if (error) {
      console.error('Error logging user action:', error);
      // Depending on severity, might add more robust error handling/reporting here
    }
  } catch (err) {
    console.error('Failed to execute logUserAction insert:', err);
    // Handle unexpected errors during the logging process
  }
}

// Example Usage (Illustrative - Do not place actual calls here)
/*
async function handleLoginSuccess(userId: string, ip: string, ua: string) {
  await logUserAction({
    userId: userId,
    action: 'LOGIN_SUCCESS',
    status: 'SUCCESS',
    ipAddress: ip,
    userAgent: ua,
    targetResourceType: 'auth',
    targetResourceId: userId,
  });
}

async function handleProfileUpdate(userId: string, updatedFields: string[]) {
  // IMPORTANT: Ensure updatedFields does NOT contain sensitive data like old passwords etc.
  await logUserAction({
    userId: userId,
    action: 'PROFILE_UPDATE',
    status: 'SUCCESS',
    targetResourceType: 'user_profile',
    targetResourceId: userId,
    details: { fieldsChanged: updatedFields } // Only log non-sensitive details
  });
}
*/ 