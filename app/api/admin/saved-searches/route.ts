import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createCreatedResponse } from '@/lib/api/common';
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware,
  validationMiddleware,
  type RouteAuthContext,
} from '@/middleware/createMiddlewareChain';
import { withSecurity } from '@/middleware/with-security';
import { getServiceSupabase } from '@/lib/database/supabase';

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

async function getAllSavedSearches(
  _req: NextRequest,
  auth: RouteAuthContext
) {
  if (!auth.userId) {
    return createSuccessResponse({ savedSearches: [] });
  }
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .or(`user_id.eq.${auth.userId},is_public.eq.true`)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching saved searches:', error);
    throw new Error('Failed to fetch saved searches');
  }
  return createSuccessResponse({ savedSearches: data || [] });
}

async function createSavedSearch(
  _req: NextRequest,
  auth: RouteAuthContext,
  data: z.infer<typeof createSavedSearchSchema>
) {
  if (!auth.userId) {
    throw new Error('Authentication required');
  }
  const supabase = getServiceSupabase();
  const { data: savedSearch, error } = await supabase
    .from('saved_searches')
    .insert({
      user_id: auth.userId,
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

const getMiddleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware({ requiredPermissions: ['admin.users.list'] }),
]);

const postMiddleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware({ requiredPermissions: ['admin.users.list'] }),
  validationMiddleware(createSavedSearchSchema),
]);

export const GET = (req: NextRequest) =>
  getMiddleware((r, auth) => getAllSavedSearches(r, auth))(req);

export const POST = (req: NextRequest) =>
  withSecurity((r) => postMiddleware((r2, auth, data) => createSavedSearch(r2, auth, data))(r))(req);
