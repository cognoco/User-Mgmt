import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
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

// PKCE helpers (optional, for providers that require it)
function base64URLEncode(str: ArrayBuffer) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
async function generatePKCEVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}
async function generatePKCEChallenge(verifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(hash);
}

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

    // PKCE (optional, for providers that require it)
    let codeChallenge: string | undefined;
    let codeVerifier: string | undefined;
    if (provider === OAuthProvider.APPLE /* || add others as needed */) {
      codeVerifier = await generatePKCEVerifier();
      codeChallenge = await generatePKCEChallenge(codeVerifier);
      cookieStore.set({
        name: `oauth_pkce_${provider}`,
        value: codeVerifier,
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 600,
        path: '/',
      });
    }

    // Build authorization URL
    const url = new URL(config.authorizationUrl!);
    url.searchParams.append('client_id', config.clientId);
    url.searchParams.append('redirect_uri', config.redirectUri);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('state', state);
    if (config.scope) url.searchParams.append('scope', config.scope);
    if (codeChallenge) {
      url.searchParams.append('code_challenge', codeChallenge);
      url.searchParams.append('code_challenge_method', 'S256');
    }

    return NextResponse.json({ url: url.toString(), state });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to initiate OAuth flow.' }, { status: 400 });
  }
} 