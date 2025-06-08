import 'next/server';

declare module 'next/server' {
  interface NextRequest {
    /**
     * Client IP address if known
     */
    ip?: string;
  }
}
