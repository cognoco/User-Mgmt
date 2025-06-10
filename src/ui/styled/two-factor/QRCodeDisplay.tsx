'use client';
import { Button } from '@/ui/primitives/button';

export interface QRCodeDisplayProps {
  qrCode?: string;
  secret?: string;
  onCopySecret?: () => void;
}

export function QRCodeDisplay({ qrCode, secret, onCopySecret }: QRCodeDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      {qrCode && <img src={qrCode} alt="QR Code" className="w-40 h-40" />}
      {secret && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Secret Key</p>
          <code className="px-2 py-1 bg-muted rounded text-sm">{secret}</code>
          <div>
            <Button variant="link" size="sm" onClick={onCopySecret}>
              Copy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QRCodeDisplay;
