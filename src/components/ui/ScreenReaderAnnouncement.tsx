'use client';

import { useEffect, useState } from 'react';

interface ScreenReaderAnnouncementProps {
  message: string;
  assertive?: boolean;
  clearAfter?: number; // milliseconds
}

export function ScreenReaderAnnouncement({
  message,
  assertive = false,
  clearAfter = 5000,
}: ScreenReaderAnnouncementProps) {
  const [announcement, setAnnouncement] = useState(message);

  useEffect(() => {
    setAnnouncement(message);
    if (clearAfter > 0) {
      const timer = setTimeout(() => {
        setAnnouncement('');
      }, clearAfter);
      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);

  return (
    <div aria-live={assertive ? 'assertive' : 'polite'} className="sr-only">
      {announcement}
    </div>
  );
}
