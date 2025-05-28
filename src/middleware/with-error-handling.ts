import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from './error-handling';

export function createErrorHandledRoute(handler: (req: NextRequest) => Promise<NextResponse>) {
  return (req: NextRequest) => withErrorHandling(handler, req);
}
