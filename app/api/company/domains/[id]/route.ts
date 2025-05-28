import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/database/supabase';
import { checkRateLimit } from '@/middleware/rate-limit';
import { withErrorHandling } from '@/middleware/error-handling';
import { withResourcePermission } from '@/middleware/withResourcePermission';
import { Permission } from '@/lib/rbac/roles';
import { z } from 'zod';

// Validation schema for updating a domain
const domainUpdateSchema = z.object({
  is_primary: z.boolean().optional(),
});

async function canAccessDomain(userId: string, domainId: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from('company_domains')
    .select('company_profiles!inner(user_id)')
    .eq('id', domainId)
    .single();
  if (error || !data) return false;
  return data.company_profiles.user_id === userId;
}

// DELETE /api/company/domains/[id] - Delete a domain
async function handleDelete(
  request: NextRequest,
  _userId: string,
  { params }: { params: { id: string } }
) {
  // 1. Rate Limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // 2. Validate domain ID
    const domainId = params.id;
    if (!domainId) {
      return NextResponse.json({ error: 'Domain ID is required' }, { status: 400 });
    }

    const supabaseService = getServiceSupabase();

    // 4. Get the domain details to check permissions and primary status
    const { data: domain, error: domainError } = await supabaseService
      .from('company_domains')
      .select('*, company_profiles!inner(user_id)')
      .eq('id', domainId)
      .single();

    if (domainError) {
      console.error(`Error fetching domain ${domainId}:`, domainError);
      return NextResponse.json({ error: 'Domain not found.' }, { status: 404 });
    }

    // 5. Check if this is a primary domain - can't delete primary domain
    if (domain.is_primary) {
      return NextResponse.json({ error: 'Cannot delete the primary domain. Set another domain as primary first.' }, { status: 400 });
    }

    // 6. Delete the domain
    const { error: deleteError } = await supabaseService
      .from('company_domains')
      .delete()
      .eq('id', domainId);

    if (deleteError) {
      console.error(`Error deleting domain ${domainId}:`, deleteError);
      return NextResponse.json({ error: 'Failed to delete domain.' }, { status: 500 });
    }

    // 8. Return success
    return NextResponse.json({ message: 'Domain deleted successfully.' });

  } catch (error) {
    console.error(`Unexpected error in DELETE /api/company/domains/${params.id}:`, error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}

// PATCH /api/company/domains/[id] - Update a domain (currently just primary status)
async function handlePatch(
  request: NextRequest,
  _userId: string,
  { params }: { params: { id: string } }
) {
  // 1. Rate Limiting
  const isRateLimited = await checkRateLimit(request);
  if (isRateLimited) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    // 2. Validate domain ID
    const domainId = params.id;
    if (!domainId) {
      return NextResponse.json({ error: 'Domain ID is required' }, { status: 400 });
    }

    const supabaseService = getServiceSupabase();

    // 4. Parse and validate request body
    const body = await request.json();
    const validationResult = domainUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationResult.error.format() 
      }, { status: 400 });
    }

    const { is_primary } = validationResult.data;

    // 5. Get the domain details to check permissions
    const { data: domain, error: domainError } = await supabaseService
      .from('company_domains')
      .select('*, company_profiles!inner(id, user_id)')
      .eq('id', domainId)
      .single();

    if (domainError) {
      console.error(`Error fetching domain ${domainId}:`, domainError);
      return NextResponse.json({ error: 'Domain not found.' }, { status: 404 });
    }

    // 6. Special handling for setting a domain as primary
    if (is_primary) {
      // First, clear primary status from all domains of this company
      const { error: updateError } = await supabaseService
        .from('company_domains')
        .update({ is_primary: false })
        .eq('company_id', domain.company_profiles.id);

      if (updateError) {
        console.error(`Error updating domain primary status for company ${domain.company_profiles.id}:`, updateError);
        return NextResponse.json({ error: 'Failed to update primary domain.' }, { status: 500 });
      }
    }

    // 8. Update the domain
    const { data: updatedDomain, error: patchError } = await supabaseService
      .from('company_domains')
      .update({
        is_primary: is_primary ?? domain.is_primary,
        updated_at: new Date().toISOString()
      })
      .eq('id', domainId)
      .select('*')
      .single();

    if (patchError) {
      console.error(`Error updating domain ${domainId}:`, patchError);
      return NextResponse.json({ error: 'Failed to update domain.' }, { status: 500 });
    }

    // 9. Return the updated domain
    return NextResponse.json(updatedDomain);

  } catch (error) {
    console.error(`Unexpected error in PATCH /api/company/domains/${params.id}:`, error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}

export const DELETE = (
  req: NextRequest,
  ctx: { params: { id: string } }
) =>
  withResourcePermission(
    (r, auth) => withErrorHandling(() => handleDelete(r, auth.userId!, ctx), r),
    {
      permission: Permission.MANAGE_DOMAINS,
      checkAccess: (uid) => canAccessDomain(uid, ctx.params.id),
    }
  )(req, ctx);

export const PATCH = (
  req: NextRequest,
  ctx: { params: { id: string } }
) =>
  withResourcePermission(
    (r, auth) => withErrorHandling(() => handlePatch(r, auth.userId!, ctx), r),
    {
      permission: Permission.MANAGE_DOMAINS,
      checkAccess: (uid) => canAccessDomain(uid, ctx.params.id),
    }
  )(req, ctx);
