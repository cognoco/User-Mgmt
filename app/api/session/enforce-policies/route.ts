import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getServiceSupabase } from '@/lib/database/supabase';
import { getSessionTimeout, getMaxSessionsPerUser } from '@/lib/security/security-policy.service';

/**
 * API route to enforce session policies
 * This can be called by:
 * 1. A scheduled cron job every few minutes
 * 2. Frontend client-side code when user is active
 */
export async function POST(req: NextRequest) {
  const res = NextResponse.next();
  
  // Create service client (admin rights)
  const supabaseService = getServiceSupabase();
  
  // Create user client (cookies)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  try {
    // Get current user
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get organization ID 
    const orgId = user.user_metadata?.current_organization_id;
    if (!orgId) {
      return NextResponse.json({ message: 'No organization policy to enforce' });
    }

    // 1. Enforce session timeout
    const timeoutMinutes = await getSessionTimeout(orgId);
    
    if (timeoutMinutes > 0) {
      // Get all sessions for this user
      const { data: sessions } = await supabaseService.auth.admin.listUserSessions(user.id);
      
      if (sessions && sessions.length > 0) {
        const currentTime = Date.now();
        const timeoutMs = timeoutMinutes * 60 * 1000;
        
        for (const session of sessions) {
          // Skip if no last activity recorded
          if (!session.user_metadata?.last_activity) continue;
          
          const lastActivity = new Date(session.user_metadata.last_activity).getTime();
          if (currentTime - lastActivity > timeoutMs) {
            // This session has exceeded the timeout
            await supabaseService.auth.admin.deleteSession(session.id);
          }
        }
      }
    }
    
    // 2. Enforce max sessions
    const maxSessions = await getMaxSessionsPerUser(orgId);
    
    if (maxSessions > 0) {
      // Get all sessions for this user
      const { data: sessions } = await supabaseService.auth.admin.listUserSessions(user.id);
      
      if (sessions && sessions.length > maxSessions) {
        // Sort sessions by last activity (oldest first)
        const sortedSessions = [...sessions].sort((a, b) => {
          const aActivity = a.user_metadata?.last_activity 
            ? new Date(a.user_metadata.last_activity).getTime()
            : new Date(a.created_at).getTime();
          
          const bActivity = b.user_metadata?.last_activity
            ? new Date(b.user_metadata.last_activity).getTime()
            : new Date(b.created_at).getTime();
          
          return aActivity - bActivity;
        });
        
        // Get current session ID
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        const currentSessionId = currentSession?.id;
        
        // Remove oldest sessions (excluding current session) to stay within limit
        const sessionsToRemove = sortedSessions.length - maxSessions;
        let removedCount = 0;
        
        for (const session of sortedSessions) {
          if (removedCount >= sessionsToRemove) break;
          
          if (session.id !== currentSessionId) {
            await supabaseService.auth.admin.deleteSession(session.id);
            removedCount++;
          }
        }
      }
    }
    
    // Update last activity timestamp for current session
    await supabase.auth.updateUser({
      data: { last_activity: new Date().toISOString() }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Session policies enforced'
    });
  } catch (error) {
    console.error('Error enforcing session policies:', error);
    return NextResponse.json({ 
      error: 'Failed to enforce session policies'
    }, { status: 500 });
  }
} 