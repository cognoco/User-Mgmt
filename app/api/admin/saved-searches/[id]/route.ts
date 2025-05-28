import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createNoContentResponse } from '@/lib/api/common';
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware,
  validationMiddleware,
  type RouteAuthContext,
} from '@/middleware/createMiddlewareChain';
import { withSecurity } from '@/middleware/with-security';
import { getServiceSupabase } from '@/lib/database/supabase';

const updateSavedSearchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  searchParams: z.record(z.any()).optional(),
  isPublic: z.boolean().optional(),
});

async function getSavedSearch(
  _req: NextRequest,
  auth: RouteAuthContext,
  { params }: { params: { id: string } }
) {
  if (!auth.userId) {
    throw new Error('Authentication required');
  }
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('id', params.id)
    .or(`user_id.eq.${auth.userId},is_public.eq.true`)
    .single();
  if (error) {
    console.error('Error fetching saved search:', error);
    throw new Error('Failed to fetch saved search');
  }
  return createSuccessResponse({ savedSearch: data });
}

async function updateSavedSearch(
  _req: NextRequest,
  auth: RouteAuthContext,
  data: z.infer<typeof updateSavedSearchSchema>,
  { params }: { params: { id: string } }
) {
  if (!auth.userId) {
    throw new Error('Authentication required');
  }
  const supabase = getServiceSupabase();
  const { data: existingSearch, error: checkError } = await supabase
    .from('saved_searches')
    .select('user_id')
    .eq('id', params.id)
    .single();
  if (checkError || !existingSearch) {
    throw new Error('Saved search not found');
  }
  if (existingSearch.user_id !== auth.userId) {
    throw new Error('You can only update your own saved searches');
  }
  const { data: updatedSearch, error: updateError } = await supabase
    .from('saved_searches')
    .update({
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.searchParams && { search_params: data.searchParams }),
      ...(data.isPublic !== undefined && { is_public: data.isPublic }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select()
    .single();
  if (updateError) {
    console.error('Error updating saved search:', updateError);
    throw new Error('Failed to update saved search');
  }
  return createSuccessResponse({ savedSearch: updatedSearch });
}

async function deleteSavedSearch(
  _req: NextRequest,
  auth: RouteAuthContext,
  { params }: { params: { id: string } }
) {
  if (!auth.userId) {
    throw new Error('Authentication required');
  }
  const supabase = getServiceSupabase();
  const { data: existingSearch, error: checkError } = await supabase
    .from('saved_searches')
    .select('user_id')
    .eq('id', params.id)
    .single();
  if (checkError || !existingSearch) {
    throw new Error('Saved search not found');
  }
  if (existingSearch.user_id !== auth.userId) {
    throw new Error('You can only delete your own saved searches');
  }
  const { error: deleteError } = await supabase.from('saved_searches').delete().eq('id', params.id);
  if (deleteError) {
    console.error('Error deleting saved search:', deleteError);
    throw new Error('Failed to delete saved search');
  }
  return createNoContentResponse();
}

const baseMiddleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware({ requiredPermissions: ['admin.users.list'] }),
]);

const patchMiddleware = createMiddlewareChain([
  errorHandlingMiddleware(),
  routeAuthMiddleware({ requiredPermissions: ['admin.users.list'] }),
  validationMiddleware(updateSavedSearchSchema),
]);

export const GET = (
  req: NextRequest,
  ctx: { params: { id: string } }
) => baseMiddleware((r, auth) => getSavedSearch(r, auth, ctx))(req);

export const PATCH = (
  req: NextRequest,
  ctx: { params: { id: string } }
) =>
  withSecurity((r) =>
    patchMiddleware((r2, auth, data) => updateSavedSearch(r2, auth, data, ctx))(r)
  )(req);

export const DELETE = (
  req: NextRequest,
  ctx: { params: { id: string } }
) =>
  withSecurity((r) =>
    baseMiddleware((r2, auth) => deleteSavedSearch(r2, auth, ctx))(r)
  )(req);
