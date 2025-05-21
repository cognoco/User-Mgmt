'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth.store';

export interface EmailVerificationProps {
  render: (props: {
    token: string;
    setToken: (value: string) => void;
    email: string;
    setEmail: (value: string) => void;
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
    handleVerify: (e: React.FormEvent) => void;
    handleResend: (e: React.FormEvent) => void;
  }) => React.ReactNode;
}

export function EmailVerification({ render }: EmailVerificationProps) {
  const verifyEmail = useAuthStore(state => state.verifyEmail);
  const sendVerificationEmail = useAuthStore(state => state.sendVerificationEmail);
  const isLoading = useAuthStore(state => state.isLoading);
  const error = useAuthStore(state => state.error);
  const successMessage = useAuthStore(state => state.successMessage);
  const clearError = useAuthStore(state => state.clearError);
  const clearSuccess = useAuthStore(state => state.clearSuccessMessage);

  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    clearSuccess();
    setSubmitted(false);
    try {
      await verifyEmail(token);
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    clearSuccess();
    setSubmitted(false);
    try {
      await sendVerificationEmail(email);
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
  };

  return (
    <>{render({ token, setToken, email, setEmail, isLoading: isLoading || false, error: submitted ? error : null, successMessage: submitted ? successMessage : null, handleVerify, handleResend })}</>
  );
}
