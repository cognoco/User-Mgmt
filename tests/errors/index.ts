import { ApiError } from '@/lib/api/common/apiError';

export async function parseErrorResponse(res: Response): Promise<ApiError['toResponse']> {
  const json = await res.json();
  return json as any;
}
