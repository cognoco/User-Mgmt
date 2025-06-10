'use client';

import React, { useState } from 'react';
import { CompanyDomain } from '@/types/company';
import { Button } from '@/ui/primitives/button';
import { Alert, AlertDescription, AlertTitle } from '@/ui/primitives/alert';
import { api } from '@/lib/api/axios';
import { useToast } from '@/lib/hooks/useToast';
import { CheckCircle, AlertCircle, Loader2, Copy } from 'lucide-react';

interface SingleDomainVerificationProps {
  domain: CompanyDomain;
  onVerificationComplete?: () => void;
}

export function SingleDomainVerification({ domain, onVerificationComplete }: SingleDomainVerificationProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(domain.verification_token || null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'verified' | 'error'>(
    domain.is_verified ? 'verified' : (domain.verification_token ? 'pending' : 'idle')
  );

  const handleInitiate = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.post(`/api/company/domains/${domain.id}/verify-initiate`);
      setStatus('pending');
      setVerificationToken(response.data.verificationToken);
      setSuccess('Verification initiated successfully. Add the TXT record to your DNS settings.');
      toast({ title: 'Verification Initiated', description: 'Check your DNS settings.' });
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || 'Failed to initiate verification.';
      setError(errMsg);
      setStatus('error');
      toast({ title: 'Error', description: errMsg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheck = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.post(`/api/company/domains/${domain.id}/verify-check`);
      const isVerified = response.data.verified;

      if (isVerified) {
        setStatus('verified');
        setVerificationToken(null); // Clear token once verified
        setSuccess('Domain successfully verified!');
        toast({ title: 'Domain Verified!' });
        onVerificationComplete?.();
      } else {
        const failMessage = response.data.message || 'Verification failed. Ensure the TXT record is correctly set and has propagated (this may take some time).';
        setError(failMessage);
        toast({ title: 'Verification Failed', description: 'TXT record not found or incorrect.' });
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to check verification.';
      setError(errMsg);
      setStatus('error');
      toast({ title: 'Error', description: errMsg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: 'Copied to clipboard!' });
    }, (err) => {
      toast({ title: 'Failed to copy', description: err.message, variant: 'destructive' });
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200 text-green-700">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {status === 'verified' && (
        <div className="flex items-center justify-center p-4 text-green-600">
          <CheckCircle className="h-6 w-6 mr-2" />
          <p className="text-sm font-medium">Domain <span className="font-bold">{domain.domain}</span> is verified.</p>
        </div>
      )}

      {status === 'pending' && verificationToken && (
        <div className="space-y-3 p-4 border rounded-md bg-muted/50">
          <p className="text-sm font-medium">Add the following TXT record to your domain&apos;s DNS settings:</p>
          <div className="space-y-1 text-sm">
            <p><span className="font-semibold">Type:</span> TXT</p>
            <p><span className="font-semibold">Host/Name:</span> @ (or your domain name)</p>
            <div className="flex items-center space-x-2">
              <span className="font-semibold">Value/Content:</span> 
              <code className="text-xs bg-background p-1 rounded border font-mono break-all flex-1">{verificationToken}</code>
              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(verificationToken)} className="h-6 w-6">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">DNS changes may take some time to propagate (up to 48 hours in rare cases).</p>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-2">
        {status !== 'verified' && status !== 'pending' && (
          <Button onClick={handleInitiate} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Initiate Verification
          </Button>
        )}
        {status === 'pending' && (
          <Button onClick={handleCheck} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Check Verification
          </Button>
        )}
      </div>
    </div>
  );
} 