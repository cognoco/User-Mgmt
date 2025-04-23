import { create } from 'zustand';
import { api } from '../api/axios';

export interface SessionInfo {
  id: string;
  created_at: string;
  last_active_at?: string;
  ip_address?: string;
  user_agent?: string;
  is_current?: boolean;
}

interface SessionState {
  sessions: SessionInfo[];
  sessionLoading: boolean;
  sessionError: string | null;
  fetchSessions: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  sessionLoading: false,
  sessionError: null,

  fetchSessions: async () => {
    set({ sessionLoading: true, sessionError: null });
    try {
      const response = await api.get('/api/session');
      set({ sessions: response.data.sessions || [], sessionLoading: false });
    } catch (error: any) {
      set({
        sessionError: error.response?.data?.error || error.message || 'Failed to fetch sessions',
        sessionLoading: false,
      });
    }
  },

  revokeSession: async (sessionId: string) => {
    set({ sessionLoading: true, sessionError: null });
    try {
      await api.delete(`/api/session/${sessionId}`);
      // Remove the session from the list
      set({ sessions: get().sessions.filter(s => s.id !== sessionId), sessionLoading: false });
    } catch (error: any) {
      set({
        sessionError: error.response?.data?.error || error.message || 'Failed to revoke session',
        sessionLoading: false,
      });
    }
  },
}));
