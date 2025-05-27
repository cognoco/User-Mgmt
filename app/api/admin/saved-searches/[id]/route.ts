import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createNoContentResponse } from '@/lib/api/common';
import { withErrorHandling } from '@/middleware/error-handling';
import { withValidation } from '@/middleware/validation';
import { createProtectedHandler } from '@/middleware/permissions';
import { withSecurity } from '@/middleware/with-security';
import { getServiceSupabase } from '@/lib/database/supabase';
import { getCurrentUser } from '@/lib/auth/session';

const updateSavedSearchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  searchParams: z.record(z.any()).optional(),
  isPublic: z.boolean().optional(),
});

async function getSavedSearch(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('id', params.id)
    .or(`user_id.eq.${user.id},is_public.eq.true`)
    .single();
  if (error) {
    console.error('Error fetching saved search:', error);
    throw new Error('Failed to fetch saved search');
  }
  return createSuccessResponse({ savedSearch: data });
}

async function updateSavedSearch(
  req: NextRequest,
  data: z.infer<typeof updateSavedSearchSchema>,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
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
  if (existingSearch.user_id !== user.id) {
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

async function deleteSavedSearch(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
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
  if (existingSearch.user_id !== user.id) {
    throw new Error('You can only delete your own saved searches');
  }
  const { error: deleteError } = await supabase.from('saved_searches').delete().eq('id', params.id);
  if (deleteError) {
    console.error('Error deleting saved search:', deleteError);
    throw new Error('Failed to delete saved search');
  }
  return createNoContentResponse();
}

export const GET = createProtectedHandler(
  (req, ctx) => withErrorHandling(() => getSavedSearch(req, ctx), req),
  'admin.users.list'
);

export const PATCH = createProtectedHandler(
  (req, ctx) =>
    withSecurity(async (r) => {
      const body = await r.json();
      return withErrorHandling(
        () => withValidation(updateSavedSearchSchema, (r2, data) => updateSavedSearch(r2, data, ctx), r, body),
        r
      );
    })(req),
  'admin.users.list'
);

export const DELETE = createProtectedHandler(
  (req, ctx) => withSecurity((r) => withErrorHandling(() => deleteSavedSearch(r, ctx), r))(req),
  'admin.users.list'
);
