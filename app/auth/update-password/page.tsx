'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResetPasswordForm } from '@/ui/styled/auth/ResetPasswordForm';

export default function UpdatePasswordPage() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const queryToken = searchParams.get('token');
    if (queryToken) {
      setToken(queryToken);
      return;
    }
    if (typeof window !== 'undefined') {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashToken = hashParams.get('access_token');
      if (hashToken) {
        setToken(hashToken);
      }
    }
  }, [searchParams]);

  if (!token) {
    return (
      <div className="container max-w-md mx-auto py-12">
        <p className="text-center text-sm text-muted-foreground">Invalid or missing token.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <ResetPasswordForm token={token} />
    </div>
  );
}
