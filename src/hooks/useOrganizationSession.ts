import { useState, useCallback } from 'react';
import { supabase } from '@/lib/database/supabase';
// import types from /src/types if available

export function useOrganizationPolicies(orgId: string) {
  const [policies, setPolicies] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('organizations')
      .select('security_settings')
      .eq('id', orgId)
      .single();
    if (error) setError(error.message);
    setPolicies(data?.security_settings || null);
    setLoading(false);
  }, [orgId]);

  const updatePolicies = useCallback(async (newPolicies: any) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from('organizations')
      .update({ security_settings: newPolicies })
      .eq('id', orgId);
    if (error) setError(error.message);
    else setPolicies(newPolicies);
    setLoading(false);
  }, [orgId]);

  return { policies, loading, error, fetchPolicies, updatePolicies };
}

export function useOrganizationMembers(orgId: string) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', orgId);
    if (error) setError(error.message);
    setMembers(data || []);
    setLoading(false);
  }, [orgId]);

  return { members, loading, error, refetch: fetchMembers };
}

export function useTerminateUserSessions(orgId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  const terminateUserSessions = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    setCount(null);
    const { data, error } = await supabase.rpc('terminate_user_sessions', { user_id: userId, organization_id: orgId });
    if (error) setError(error.message);
    setCount(data?.count || 0);
    setLoading(false);
    return { count: data?.count || 0, error };
  }, [orgId]);

  return { terminateUserSessions, loading, error, count };
}

export function useReauthentication() {
  const [showDialog, setShowDialog] = useState(false);
  const [requireReauth, setRequireReauth] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyReauth = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else setShowDialog(false);
    return !error;
  }, []);

  return { showDialog, setShowDialog, requireReauth, setRequireReauth, verifyReauth, error };
} 