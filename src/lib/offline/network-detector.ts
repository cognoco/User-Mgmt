export function detectNetworkStatus(): boolean {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine;
  }
  return true;
}

export async function verifyConnectivity(): Promise<boolean> {
  if (!detectNetworkStatus()) return false;
  try {
    const response = await fetch('/api/health/ping?_=' + Date.now(), {
      method: 'HEAD',
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
      mode: 'cors',
    } as RequestInit);
    return response.ok;
  } catch {
    return false;
  }
}

export type ConnectivityState = 'strong' | 'weak' | 'offline';
export type ConnectivityListener = (state: ConnectivityState) => void;

export class NetworkDetector {
  private listeners = new Set<ConnectivityListener>();
  private heartbeatId?: ReturnType<typeof setInterval>;
  private latency = 0;
  private state: ConnectivityState = detectNetworkStatus() ? 'strong' : 'offline';

  constructor(private heartbeatInterval = 30000) {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
      this.startHeartbeat();
    }
  }

  private handleOnline = () => {
    this.updateState();
  };

  private handleOffline = () => {
    this.changeState('offline');
  };

  private changeState(state: ConnectivityState) {
    if (this.state !== state) {
      this.state = state;
      this.listeners.forEach(cb => cb(this.state));
    }
  }

  private async updateState() {
    const start = Date.now();
    const ok = await verifyConnectivity();
    this.latency = Date.now() - start;
    if (!ok) {
      this.changeState('offline');
    } else {
      const quality = this.latency < 300 ? 'strong' : 'weak';
      this.changeState(quality);
    }
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatId = setInterval(() => this.updateState(), this.heartbeatInterval);
  }

  stopHeartbeat() {
    if (this.heartbeatId) {
      clearInterval(this.heartbeatId);
      this.heartbeatId = undefined;
    }
  }

  onChange(listener: ConnectivityListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState() {
    return this.state;
  }

  getLatency() {
    return this.latency;
  }
}

export const networkDetector = typeof window !== 'undefined' ? new NetworkDetector() : undefined;
