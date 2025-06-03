import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectNetworkStatus, verifyConnectivity, NetworkDetector } from '../network-detector';

describe('detectNetworkStatus', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses navigator.onLine when available', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValueOnce(false);
    expect(detectNetworkStatus()).toBe(false);
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValueOnce(true);
    expect(detectNetworkStatus()).toBe(true);
  });

  it('assumes online when navigator not available', () => {
    const original = (global as any).navigator;
    // @ts-ignore
    delete (global as any).navigator;
    expect(detectNetworkStatus()).toBe(true);
    (global as any).navigator = original;
  });
});

describe('verifyConnectivity', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns false when offline', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValueOnce(false);
    const result = await verifyConnectivity();
    expect(result).toBe(false);
  });

  it('pings health endpoint', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as any;
    const result = await verifyConnectivity();
    expect(fetchMock).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});

describe('NetworkDetector', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    // reset fetch
    // @ts-ignore
    delete global.fetch;
    delete (window.navigator as any).onLine;
  });

  it('emits state changes based on connectivity', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    global.fetch = fetchMock as any;
    vi.spyOn(Date, 'now').mockReturnValueOnce(0).mockReturnValueOnce(100);
    const detector = new NetworkDetector(1000);
    const handler = vi.fn();
    detector.onChange(handler);
    await (detector as any).updateState();
    expect(detector.getState()).toBe('strong');
    expect(detector.getLatency()).toBe(100);
    expect(handler).toHaveBeenCalledWith('strong');
    detector.stopHeartbeat();
  });
});
