export enum OAuthProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  GITHUB = 'github',
  TWITTER = 'twitter',
  MICROSOFT = 'microsoft',
  APPLE = 'apple',
  LINKEDIN = 'linkedin'
}

export interface OAuthConfig {
  provider: OAuthProvider;
  clientId: string;
  scopes?: string[];
  additionalParams?: Record<string, string>;
}

export interface OAuthError {
  message: string;
  code?: string;
  provider?: OAuthProvider;
} 