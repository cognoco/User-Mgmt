import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';
import { getUserHomePage } from '@/lib/utils/getUserHomePage';
import { toast } from '@/components/ui/use-toast';
import { useOAuthStore } from '@/lib/stores/oauth.store';
import { OAuthProvider } from '@/types/oauth';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

export function OAuthCallback() {
  const { t } = useTranslation();
  const { handleCallback, isLoading, error } = useOAuthStore();
  const [processingState, setProcessingState] = useState<'initial' | 'processing' | 'error' | 'success'>('initial');
  
  useEffect(() => {
    const processCallback = async () => {
      try {
        setProcessingState('processing');
        
        // Get query parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const provider = urlParams.get('provider') as OAuthProvider;
        const error = urlParams.get('error');
        
        // Handle error from OAuth provider
        if (error) {
          if (process.env.NODE_ENV === 'development') { console.error(`Provider error: ${error}`); }
          throw new Error(`Provider error: ${error}`);
        }
        
        // Validate required parameters
        if (!code) {
          if (process.env.NODE_ENV === 'development') { console.error('Authorization code is missing'); }
          throw new Error('Authorization code is missing');
        }
        
        if (!provider) {
          if (process.env.NODE_ENV === 'development') { console.error('Provider is missing'); }
          throw new Error('Provider is missing');
        }
        
        // Process the callback
        await handleCallback(provider, code);
        setProcessingState('success');
        // Get the user from auth store
        const user = useAuthStore.getState().user;
        // Determine homepage
        const homepage = user ? getUserHomePage(user) : '/dashboard';
        // Show toast on next page load (using sessionStorage as a cross-page flag)
        sessionStorage.setItem('show_oauth_linked_toast', '1');
        // Redirect
        window.location.replace(homepage);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') { console.error('OAuth callback error:', error); }
        setProcessingState('error');
      }
    };
    
    processCallback();
  }, [handleCallback]);
  
  // Render loading state
  if (processingState === 'initial' || processingState === 'processing') {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>{t('oauth.callback.title')}</CardTitle>
          <CardDescription>{t('oauth.callback.processing')}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Spinner size="lg" />
        </CardContent>
      </Card>
    );
  }
  
  // Render error state
  if (processingState === 'error' || error) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>{t('oauth.callback.errorTitle')}</CardTitle>
          <CardDescription>{t('oauth.callback.errorDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error || t('oauth.callback.genericError')}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <a href="/login" className="text-primary hover:underline">
              {t('oauth.callback.backToLogin')}
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Success state (should redirect, but just in case)
  return null; // No UI, as we redirect immediately

} 