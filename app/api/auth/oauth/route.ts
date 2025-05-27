import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { OAuthProvider, oauthProviderConfigSchema } from '@/types/oauth';

// Request schema
const initiationRequestSchema = z.object({
  provider: z.nativeEnum(OAuthProvider),
});

// Helper to generate random state
function generateState(length = 32) {
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Supabase already handles PKCE internally when using signInWithOAuth

// Example: provider config source (replace with actual config source as needed)
const providerConfigs: Record<OAuthProvider, z.infer<typeof oauthProviderConfigSchema>> = {
  [OAuthProvider.GOOGLE]: {
    provider: OAuthProvider.GOOGLE,
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!,
    scope: 'profile email',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    enabled: true,
  },
  [OAuthProvider.GITHUB]: {
    provider: OAuthProvider.GITHUB,
    clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!,
    redirectUri: process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI!,
    scope: 'user:email',
    authorizationUrl: 'https://github.com/login/oauth/authorize',
    enabled: true,
  },
  // Add other providers as needed
  [OAuthProvider.FACEBOOK]: {
    provider: OAuthProvider.FACEBOOK,
    clientId: '',
    redirectUri: '',
    scope: '',
    authorizationUrl: '',
    enabled: false,
  },
  [OAuthProvider.TWITTER]: {
    provider: OAuthProvider.TWITTER,
    clientId: '',
    redirectUri: '',
    scope: '',
    authorizationUrl: '',
    enabled: false,
  },
  [OAuthProvider.MICROSOFT]: {
    provider: OAuthProvider.MICROSOFT,
    clientId: '',
    redirectUri: '',
    scope: '',
    authorizationUrl: '',
    enabled: false,
  },
  [OAuthProvider.APPLE]: {
    provider: OAuthProvider.APPLE,
    clientId: '',
    redirectUri: '',
    scope: '',
    authorizationUrl: '',
    enabled: false,
  },
  [OAuthProvider.LINKEDIN]: {
    provider: OAuthProvider.LINKEDIN,
    clientId: '',
    redirectUri: '',
    scope: '',
    authorizationUrl: '',
    enabled: false,
  },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider } = initiationRequestSchema.parse(body);

    const config = providerConfigs[provider];
    if (!config || !config.enabled) {
      return NextResponse.json({ error: 'Provider not supported or not enabled.' }, { status: 400 });
    }

    // Generate state for CSRF protection
    const state = generateState();
    const cookieStore = cookies();
    cookieStore.set({
      name: `oauth_state_${provider}`,
      value: state,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: config.redirectUri,
        scopes: config.scope,
        state,
      },
    });

    if (error || !data?.url) {
      return NextResponse.json(
        { error: error?.message || 'Failed to initiate OAuth flow.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ url: data.url, state });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to initiate OAuth flow.' }, { status: 400 });
  }
}
