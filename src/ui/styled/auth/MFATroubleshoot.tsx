'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/ui/primitives/alert';

interface MFATroubleshootProps {
  helpUrl?: string;
}

/**
 * MFA troubleshooting guidance.
 */
export function MFATroubleshoot({ helpUrl }: MFATroubleshootProps) {
  return (
    <Alert className="mt-4" role="alert">
      <AlertTitle>Having trouble with your MFA code?</AlertTitle>
      <AlertDescription>
        <ul className="list-disc list-inside space-y-1">
          <li>Ensure your device clock is correct.</li>
          <li>Check that you are using the latest code from your authenticator app.</li>
          <li>If problems persist, use a backup code or request a new one.</li>
          {helpUrl && (
            <li>
              <a href={helpUrl} className="underline" target="_blank" rel="noopener noreferrer">
                Learn more
              </a>
            </li>
          )}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
export default MFATroubleshoot;
