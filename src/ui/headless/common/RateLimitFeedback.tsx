import { useState, useEffect } from 'react';

/**
 * Headless RateLimit Feedback
 */
export interface RateLimitFeedbackProps {
  windowMs: number;
  retryAfter?: number;
  maxAttempts?: number;
  remainingAttempts?: number;
  onCountdownComplete?: () => void;
  render: (props: {
    timeLeft: number;
    progress: number;
    minutes: number;
    seconds: number;
  }) => React.ReactNode;
}

export default function RateLimitFeedback({
  windowMs = 15 * 60 * 1000,
  retryAfter,
  onCountdownComplete,
  render
}: RateLimitFeedbackProps) {
  const [timeLeft, setTimeLeft] = useState(retryAfter || windowMs);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (timeLeft <= 0) {
      onCountdownComplete?.();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1000;
        setProgress((newTime / (retryAfter || windowMs)) * 100);
        return newTime;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, windowMs, retryAfter, onCountdownComplete]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return <>{render({ timeLeft, progress, minutes, seconds })}</>;
}
