import { Spinner } from '@/src/ui/primitives/spinner';

interface PageLoaderProps {
  label?: string;
}

/**
 * Full page loading indicator used during initial application load.
 */
export function PageLoader({ label = 'Loading' }: PageLoaderProps) {
  return (
    <div
      className="flex items-center justify-center min-h-screen"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <Spinner className="h-12 w-12" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default PageLoader;
