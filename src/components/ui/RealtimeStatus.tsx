import { CheckCircle2, XCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/ui/primitives/tooltip';

interface RealtimeStatusProps {
  isConnected: boolean;
}

export function RealtimeStatus({ isConnected }: RealtimeStatusProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            {isConnected ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" aria-hidden="true" />
            )}
            <span className="sr-only">
              {isConnected ? 'Realtime updates active' : 'Realtime updates not connected'}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isConnected ? 'Realtime updates active' : 'Realtime updates not connected'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
