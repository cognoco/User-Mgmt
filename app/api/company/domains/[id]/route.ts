import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/database/supabase";
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware,
  rateLimitMiddleware,
  validationMiddleware,
} from "@/middleware/createMiddlewareChain";
import { z } from "zod";
import { checkPermission } from "@/lib/auth/permissionCheck";
import { PermissionValues } from "@/core/permission/models";

// Validation schema for updating a domain
const domainUpdateSchema = z.object({
  is_primary: z.boolean().optional(),
});

type DomainUpdateRequest = z.infer<typeof domainUpdateSchema>;

const baseMiddleware = createMiddlewareChain([
  rateLimitMiddleware(),
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
]);

const patchMiddleware = createMiddlewareChain([
  rateLimitMiddleware(),
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
  validationMiddleware(domainUpdateSchema),
]);

async function canAccessDomain(userId: string, domainId: string) {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("company_domains")
    .select("company_profiles!inner(user_id)")
    .eq("id", domainId)
    .single();
  if (error || !data) return false;
  return data.company_profiles.user_id === userId;
}

// DELETE /api/company/domains/[id] - Delete a domain
async function handleDelete(
  _request: NextRequest,
  auth: RouteAuthContext,
  params: { id: string },
) {
  try {
    // 2. Validate domain ID
    const domainId = params.id;
    if (!domainId) {
      return NextResponse.json(
        { error: "Domain ID is required" },
        { status: 400 },
      );
    }

    const supabaseService = getServiceSupabase();

    // 4. Get the domain details to check permissions and primary status
    const { data: domain, error: domainError } = await supabaseService
      .from("company_domains")
      .select("*, company_profiles!inner(user_id)")
      .eq("id", domainId)
      .single();

    if (domainError) {
      console.error(`Error fetching domain ${domainId}:`, domainError);
      return NextResponse.json({ error: "Domain not found." }, { status: 404 });
    }

    // Check access rights
    const allowed =
      domain.company_profiles.user_id === auth.userId ||
      (await checkPermission(
        auth.userId!,
        PermissionValues.MANAGE_SETTINGS,
        'company',
        domain.company_profiles.id,
      )) ||
      (await checkPermission(auth.userId!, PermissionValues.MANAGE_SETTINGS));
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 5. Check if this is a primary domain - can't delete primary domain
    if (domain.is_primary) {
      return NextResponse.json(
        {
          error:
            "Cannot delete the primary domain. Set another domain as primary first.",
        },
        { status: 400 },
      );
    }

    // 6. Delete the domain
    const { error: deleteError } = await supabaseService
      .from("company_domains")
      .delete()
      .eq("id", domainId);

    if (deleteError) {
      console.error(`Error deleting domain ${domainId}:`, deleteError);
      return NextResponse.json(
        { error: "Failed to delete domain." },
        { status: 500 },
      );
    }

    // 8. Return success
    return NextResponse.json({ message: "Domain deleted successfully." });
  } catch (error) {
    console.error(
      `Unexpected error in DELETE /api/company/domains/${params.id}:`,
      error,
    );
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 },
    );
  }
}

// PATCH /api/company/domains/[id] - Update a domain (currently just primary status)
async function handlePatch(
  _request: NextRequest,
  auth: RouteAuthContext,
  params: { id: string },
  data: DomainUpdateRequest,
) {
  try {
    // 2. Validate domain ID
    const domainId = params.id;
    if (!domainId) {
      return NextResponse.json(
        { error: "Domain ID is required" },
        { status: 400 },
      );
    }

    const supabaseService = getServiceSupabase();

    const { is_primary } = data;

    // 5. Get the domain details to check permissions
    const { data: domain, error: domainError } = await supabaseService
      .from("company_domains")
      .select("*, company_profiles!inner(id, user_id)")
      .eq("id", domainId)
      .single();

    if (domainError) {
      console.error(`Error fetching domain ${domainId}:`, domainError);
      return NextResponse.json({ error: "Domain not found." }, { status: 404 });
    }

    const allowed =
      domain.company_profiles.user_id === auth.userId ||
      (await checkPermission(
        auth.userId!,
        PermissionValues.MANAGE_SETTINGS,
        'company',
        domain.company_profiles.id,
      )) ||
      (await checkPermission(auth.userId!, PermissionValues.MANAGE_SETTINGS));
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 6. Special handling for setting a domain as primary
    if (is_primary) {
      // First, clear primary status from all domains of this company
      const { error: updateError } = await supabaseService
        .from("company_domains")
        .update({ is_primary: false })
        .eq("company_id", domain.company_profiles.id);

      if (updateError) {
        console.error(
          `Error updating domain primary status for company ${domain.company_profiles.id}:`,
          updateError,
        );
        return NextResponse.json(
          { error: "Failed to update primary domain." },
          { status: 500 },
        );
      }
    }

    // 8. Update the domain
    const { data: updatedDomain, error: patchError } = await supabaseService
      .from("company_domains")
      .update({
        is_primary: is_primary ?? domain.is_primary,
        updated_at: new Date().toISOString(),
      })
      .eq("id", domainId)
      .select("*")
      .single();

    if (patchError) {
      console.error(`Error updating domain ${domainId}:`, patchError);
      return NextResponse.json(
        { error: "Failed to update domain." },
        { status: 500 },
      );
    }

    // 9. Return the updated domain
    return NextResponse.json(updatedDomain);
  } catch (error) {
    console.error(
      `Unexpected error in PATCH /api/company/domains/${params.id}:`,
      error,
    );
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 },
    );
  }
}

export const DELETE = (req: NextRequest, ctx: { params: { id: string } }) =>
  baseMiddleware((r, auth) => handleDelete(r, auth, ctx.params))(req);

export const PATCH = (req: NextRequest, ctx: { params: { id: string } }) =>
  patchMiddleware((r, auth, data) => handlePatch(r, auth, ctx.params, data))(
    req,
  );
