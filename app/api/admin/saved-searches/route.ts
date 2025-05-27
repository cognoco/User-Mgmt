import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createCreatedResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { createProtectedHandler } from '@/middleware/permissions';
import { withSecurity } from '@/middleware/with-security';
import { getServiceSupabase } from '@/lib/database/supabase';
import { getCurrentUser } from '@/lib/auth/session';

const savedSearchParamsSchema = z.object({
  query: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'all']).optional(),
  role: z.string().optional(),
  dateCreatedStart: z.string().optional(),
  dateCreatedEnd: z.string().optional(),
  dateLastLoginStart: z.string().optional(),
  dateLastLoginEnd: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'createdAt', 'lastLoginAt', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  teamId: z.string().optional(),
});

const createSavedSearchSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  searchParams: savedSearchParamsSchema,
  isPublic: z.boolean().default(false),
});

async function getAllSavedSearches(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return createSuccessResponse({ savedSearches: [] });
  }
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .or(`user_id.eq.${user.id},is_public.eq.true`)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching saved searches:', error);
    throw new Error('Failed to fetch saved searches');
  }
  return createSuccessResponse({ savedSearches: data || [] });
}

async function createSavedSearch(req: NextRequest, data: z.infer<typeof createSavedSearchSchema>) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  const supabase = getServiceSupabase();
  const { data: savedSearch, error } = await supabase
    .from('saved_searches')
    .insert({
      user_id: user.id,
      name: data.name,
      description: data.description || '',
      search_params: data.searchParams,
      is_public: data.isPublic,
    })
    .select()
    .single();
  if (error) {
    console.error('Error creating saved search:', error);
    throw new Error('Failed to create saved search');
  }
  return createCreatedResponse({ savedSearch });
}

export const GET = createProtectedHandler(
  (req) => withErrorHandling(() => getAllSavedSearches(req), req),
  'admin.users.list'
);

export const POST = createProtectedHandler(
  (req) =>
    withSecurity(async (r) => {
      const body = await r.json();
      return withErrorHandling(
        () => withValidation(createSavedSearchSchema, createSavedSearch, r, body),
        r
      );
    })(req),
  'admin.users.list'
);
