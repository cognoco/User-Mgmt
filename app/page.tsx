'use client'; // Required for hooks

import { useTranslation } from 'react-i18next';
import Link from 'next/link'; // Use next/link
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth.store';

// Replaces the previous placeholder HomePage
export default function HomePage() { 
  const { t } = useTranslation(); // Assuming i18n setup works
  // Get auth state directly from store
  const { isAuthenticated } = useAuthStore((state) => ({ 
      isAuthenticated: state.isAuthenticated 
  }));

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          {t('home.title', 'Welcome to User Management')} 
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          {t('home.description', 'A powerful and flexible user management system that can be integrated into any application.')}
        </p>
        <div className="mt-10 flex items-center gap-x-6">
          {isAuthenticated ? (
            <>
              {/* Use next/link and href */}
              <Link href="/profile">
                <Button>{t('home.viewProfile', 'View Profile')}</Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline">{t('home.settings', 'Settings')}</Button>
              </Link>
            </>
          ) : (
            <>
              {/* Use next/link and href */}
              <Link href="/register">
                <Button>{t('home.getStarted', 'Get Started')}</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">{t('home.signIn', 'Sign In')}</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6"> {/* Use card bg */} 
          <h3 className="text-lg font-semibold">{t('home.feature.auth.title', 'Authentication')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('home.feature.auth.description', 'Secure user authentication with email/password, social login, and two-factor authentication.')}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6"> {/* Use card bg */} 
          <h3 className="text-lg font-semibold">{t('home.feature.profile.title', 'Profile Management')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('home.feature.profile.description', 'Customizable user profiles with avatar support and privacy settings.')}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6"> {/* Use card bg */} 
          <h3 className="text-lg font-semibold">{t('home.feature.rbac.title', 'Role-Based Access')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('home.feature.rbac.description', 'Flexible role and permission system for controlling user access.')}
          </p>
        </div>
      </div>
    </div>
  );
} 