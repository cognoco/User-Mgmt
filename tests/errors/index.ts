import { ApiError } from '@/lib/api/common/apiError'0;

export async function parseErrorResponse(res: Response): Promise<ApiError['toResponse']> {
  const json = await res.json();
  return json as any;
}
