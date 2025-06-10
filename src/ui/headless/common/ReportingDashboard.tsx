import { useState, useEffect } from 'react';

interface ReportData {
  users: number;
  activeSessions: number;
  signupsToday: number;
  errorRate: number;
}

/**
 * Headless Reporting Dashboard
 */
export default function ReportingDashboard({
  render
}: {
  render: (props: { data: ReportData | null; isLoading: boolean; error: string | null }) => React.ReactNode;
}) {
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      setData({ users: 1500, activeSessions: 120, signupsToday: 25, errorRate: 2.5 });
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return <>{render({ data, isLoading, error })}</>;
}
