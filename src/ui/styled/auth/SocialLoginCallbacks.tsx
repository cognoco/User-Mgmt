'use client';

import { SocialLoginCallbacks as HeadlessSocialLoginCallbacks } from '@/ui/headless/auth/SocialLoginCallbacks';
import { OAuthCallback } from '@/src/ui/styled/auth/OAuthCallback'130;

export function SocialLoginCallbacks() {
  return (
    <HeadlessSocialLoginCallbacks render={() => <OAuthCallback />} />
  );
}
