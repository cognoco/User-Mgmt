export async function detectNetworkStatus(): Promise<boolean> {
  if (typeof navigator === 'undefined') {
    return true;
  }

  if (navigator.onLine) {
    return true;
  }

  try {
    // Fallback ping to confirm connectivity
    await fetch('/', { method: 'HEAD', cache: 'no-store' });
    return true;
  } catch {
    return false;
  }
}
