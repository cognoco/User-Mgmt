import { useState } from 'react';

export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApi = async <T>(url: string, options?: RequestInit): Promise<T | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(url, options);
      const data = await res.json();
      if (!res.ok) {
        const message = data?.error?.message || res.statusText;
        throw new Error(message);
      }
      return data.data ?? data;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, fetchApi };
}
export default useApi;
