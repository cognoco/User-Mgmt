/**
 * Headless Search Page Component
 *
 * Exposes search state and callbacks without UI rendering.
 */
import { useEffect, useState } from 'react';

export interface SearchPageProps {
  onSearch?: (query: string) => Promise<any[]>;
  render: (props: {
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    results: any[];
    isLoading: boolean;
    error: string | null;
  }) => React.ReactNode;
}

export function SearchPage({ onSearch, render }: SearchPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!onSearch) return;
      setIsLoading(true);
      setError(null);
      try {
        setResults(await onSearch(searchTerm));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (searchTerm) fetch();
  }, [searchTerm, onSearch]);

  return <>{render({ searchTerm, setSearchTerm, results, isLoading, error })}</>;
}
