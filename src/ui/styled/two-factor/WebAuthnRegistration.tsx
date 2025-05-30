'use client';
import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { Button } from '@/ui/primitives/button';

export function WebAuthnRegistration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  const register = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/2fa/webauthn/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 'options' })
      });
      const options = await res.json();
      const credential = await startRegistration(options);
      const verifyRes = await fetch('/api/2fa/webauthn/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 'verification', credential })
      });
      const data = await verifyRes.json();
      if (data.verified) {
        setRegistered(true);
      } else {
        throw new Error(data.error || 'Verification failed');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (registered) {
    return <p className="text-sm">Security key registered successfully.</p>;
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button onClick={register} disabled={isLoading}>
        {isLoading ? 'Registering...' : 'Register Security Key'}
      </Button>
    </div>
  );
}

export default WebAuthnRegistration;
