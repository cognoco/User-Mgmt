'use client';

export interface SocialLoginCallbacksProps {
  render: () => React.ReactNode;
}

export function SocialLoginCallbacks({ render }: SocialLoginCallbacksProps) {
  return <>{render()}</>;
}
