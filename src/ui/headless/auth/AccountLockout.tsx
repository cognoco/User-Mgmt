'use client';

export interface AccountLockoutProps {
  message?: string;
  render: (props: { message: string }) => React.ReactNode;
}

export function AccountLockout({ message = 'Your account has been temporarily locked due to too many failed login attempts. Please try again later or contact support.', render }: AccountLockoutProps) {
  return <>{render({ message })}</>;
}
