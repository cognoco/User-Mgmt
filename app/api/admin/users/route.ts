import { type NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { z } from 'zod';
import { getServiceSupabase } from '@/lib/database/supabase';

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional().default(''),
  sortBy: z.enum(['createdAt', 'email', 'name', 'status']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

type QueryParams = z.infer<typeof querySchema>;

async function handleGet(_req: NextRequest, params: QueryParams) {
  const { page, limit, search, sortBy, sortOrder } = params;

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit - 1;

  const supabase = getServiceSupabase();

  try {
    let query = supabase
      .from('users')
      .select('id, email, first_name, last_name, user_type, created_at, status', { count: 'exact' });

    if (search) {
      query = query.or(
        `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`
      );
    }

    const orderColumn: Record<string, string> = {
      createdAt: 'created_at',
      email: 'email',
      name: 'first_name',
      status: 'status',
    };

    query = query.order(orderColumn[sortBy] ?? 'created_at', { ascending: sortOrder === 'asc' });

    const { data, error, count } = await Promise.race([
      query.range(startIndex, endIndex),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      ),
    ]);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      users: data ?? [],
      pagination: {
        page,
        limit,
        total: count ?? 0,
        pages: count ? Math.ceil(count / limit) : 0,
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching users:', error);
    const status = error instanceof Error && error.message === 'Database query timeout' ? 504 : 500;
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    return NextResponse.json({ error: message }, { status });
  }
}

export const GET = (req: NextRequest) =>
  withErrorHandling(
    (r) =>
      withValidation(
        querySchema,
        (r2, data) => handleGet(r2, data),
        r,
        Object.fromEntries(new URL(r.url).searchParams.entries())
      ),
    req
  );
