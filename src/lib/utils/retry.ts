export interface RetryOptions {
  retries?: number;
  delayMs?: number;
  isRetryable?: (error: any) => boolean;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const defaultIsRetryable = (error: any): boolean => {
  const status = error?.response?.status;
  if (status && status >= 500 && status < 600) return true;
  if (error && !error.response) {
    return (
      error.code === 'NETWORK_ERROR' || /network/i.test(error.message || '')
    );
  }
  return false;
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    retries = 1,
    delayMs = 200,
    isRetryable = defaultIsRetryable,
  } = options;

  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries || !isRetryable(err)) {
        throw err;
      }
      attempt++;
      await sleep(delayMs * attempt);
    }
  }
}
