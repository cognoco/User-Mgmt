import { NextRequest, NextResponse } from 'next/server';
import { createSuccessResponse, ApiError, ERROR_CODES } from '@/lib/api/common';
import { enforceSessionPolicies } from '@/services/session/enforce-session-policies.service';

export async function POST(req: NextRequest) {
  const res = NextResponse.next();
  const result = await enforceSessionPolicies(req, res);

  if (!result.success) {
    const status = result.error === 'Not authenticated' ? 401 : 500;
    throw new ApiError(
      status === 401 ? ERROR_CODES.UNAUTHORIZED : ERROR_CODES.INTERNAL_ERROR,
      result.error || 'Failed to enforce session policies',
      status
    );
  }

  const response = createSuccessResponse({ message: result.message || 'Session policies enforced' });
  res.cookies.getAll().forEach(cookie => {
    response.cookies.set(cookie);
  });
  return response;
}
