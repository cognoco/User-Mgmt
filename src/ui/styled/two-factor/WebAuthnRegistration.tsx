'use client';

import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import { Button } from '@/ui/primitives/button';
import { Alert, AlertDescription } from '@/ui/primitives/alert';
import { DeviceFloppy, CheckCircle2 } from 'lucide-react';

export function WebAuthnRegistration() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    setIsRegistering(true);
    setError(null);
    try {
      // Step 1: Get registration options from server
      const optionsRes = await fetch('/api/2fa/webauthn/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase: 'options' })
      });

      if (!optionsRes.ok) {
        const errorData = await optionsRes.json();
        throw new Error(errorData.error || 'Failed to start registration');
      }

      const options = await optionsRes.json();

      // Step 2: Create credentials on device
      const credential = await startRegistration(options);

      // Step 3: Verify with server
      const verifyRes = await fetch('/api/2fa/webauthn/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: 'verification',
          credential
        })
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json();
        throw new Error(errorData.error || 'Verification failed');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      console.error(err);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <DeviceFloppy className="h-5 w-5" />
        <h3 className="text-lg font-medium">Security Key or Biometric Authentication</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Use a security key (like YubiKey) or device biometrics (like fingerprint or face recognition) for stronger security.
      </p>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success ? (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Security key registered successfully!</AlertDescription>
        </Alert>
      ) : (
        <Button
          onClick={handleRegister}
          disabled={isRegistering}
          variant="outline"
          className="w-full"
        >
          {isRegistering ? 'Registering...' : 'Register Security Key'}
        </Button>
      )}
    </div>
  );
}

export default WebAuthnRegistration;
