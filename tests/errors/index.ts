import { ApiError } from '@/lib/api/common/api-error';

export async function parseErrorResponse(res: Response): Promise<ApiError['toResponse']> {
  const json = await res.json();
  return json as any;
}
