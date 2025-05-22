'use client';

import React, { useState, useEffect } from 'react';
import { CompanyProfile } from '@/types/company';
import { Button } from '@/ui/primitives/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/ui/primitives/card';
import { Alert, AlertDescription, AlertTitle } from '@/ui/primitives/alert';
import { Badge } from '@/ui/primitives/badge';
import { api } from '@/lib/api/axios';
import { useToast } from '@/ui/primitives/use-toast';
import { CheckCircle, Clock, AlertCircle, Loader2, Copy } from 'lucide-react';

interface DomainVerificationProps {
  profile: Pick<
    CompanyProfile,
    'id' | 'domain_name' | 'domain_verified' | 'domain_verification_token' | 'website'
  > | null;
  onVerificationChange?: () => void; // Optional callback after status changes
}

export function DomainVerification({ profile, onVerificationChange }: DomainVerificationProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'verified' | 'error'>('idle');
  const [token, setToken] = useState<string | null>(null);
  const [domain, setDomain] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    if (profile?.domain_verified) {
      setStatus('verified');
      setDomain(profile.domain_name ?? null);
      setToken(null);
    } else if (profile?.domain_verification_token) {
      setStatus('pending');
      setDomain(profile.domain_name ?? null);
      setToken(profile.domain_verification_token ?? null);
    } else {
      setStatus('idle');
      try {
        setDomain(profile?.website ? new URL(profile.website).hostname.replace(/^www\./, '') : null);
      } catch { setDomain(null); }
      setToken(null);
    }
  }, [profile]);

  const handleInitiate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/company/verify-domain/initiate');
      setStatus('pending');
      setDomain(response.data.domainName);
      setToken(response.data.verificationToken);
      toast({ title: 'Verification Initiated', description: 'Check your DNS settings.' });
      onVerificationChange?.(); // Notify parent if needed
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
    try {
      // Call the actual check endpoint
      const response = await api.post('/api/company/verify-domain/check');
      const isVerified = response.data.verified;

      if (isVerified) {
        setStatus('verified');
        setToken(null); // Clear token once verified
        toast({ title: 'Domain Verified!' });
        onVerificationChange?.(); // Notify parent
      } else {
        const failMessage = response.data.message || 'Verification failed. Ensure the TXT record is correctly set and has propagated (this may take some time).';
        setError(failMessage);
        setStatus('pending');
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

  const renderStatus = () => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="secondary" className="flex items-center space-x-1 text-green-600 border-green-300">
            <CheckCircle className="h-4 w-4" />
            <span>Verified</span>
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>Pending Verification</span>
          </Badge>
        );
      case 'error':
         return (
            <Badge variant="destructive" className="flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>Error</span>
            </Badge>
         );
      default:
        return (
            <Badge variant="outline" className="flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>Not Verified</span>
            </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Domain Verification</CardTitle>
                <CardDescription>Verify ownership of your company&apos;s domain ({domain || 'Not Set'}).</CardDescription>
            </div>
            {renderStatus()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status === 'pending' && token && (
          <div className="space-y-3 p-4 border rounded-md bg-muted/50">
            <p className="text-sm font-medium">Add the following TXT record to your domain's DNS settings:</p>
            <div className="space-y-1 text-sm">
                <p><span className="font-semibold">Type:</span> TXT</p>
                <p><span className="font-semibold">Host/Name:</span> @ (or your domain name)</p>
                <div className="flex items-center space-x-2">
                    <span className="font-semibold">Value/Content:</span> 
                    <code className="text-xs bg-background p-1 rounded border font-mono break-all">{token}</code>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(token)} className="h-6 w-6">
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <p className="text-xs text-muted-foreground">DNS changes may take some time to propagate (up to 48 hours in rare cases).</p>
          </div>
        )}

        {status === 'verified' && domain && (
            <p className="text-sm text-green-600">Domain <span className="font-semibold">{domain}</span> successfully verified.</p>
        )}

      </CardContent>
      <CardFooter className="flex justify-end">
        {status !== 'verified' && status !== 'pending' && (
          <Button onClick={handleInitiate} disabled={isLoading || !profile?.website}>
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
      </CardFooter>
    </Card>
  );
} 