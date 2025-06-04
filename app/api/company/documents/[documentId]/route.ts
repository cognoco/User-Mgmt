import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceSupabase } from "@/lib/database/supabase";
import { type RouteAuthContext } from "@/middleware/auth";
import { createApiHandler } from "@/lib/api/route-helpers";
import { createSuccessResponse } from "@/lib/api/common";


// --- DELETE Handler for removing company documents ---
async function handleDelete(
  _request: NextRequest,
  params: { documentId: string },
  auth: RouteAuthContext,
  services: any
) {
  try {
    const supabaseService = getServiceSupabase();
    const userId = auth.userId!;

    const companyProfile = await services.addressService.getProfileByUserId(userId);

    if (!companyProfile) {
      return NextResponse.json(
        { error: "Company profile not found" },
        { status: 404 },
      );
    }

    // 4. Get Document
    const { data: document, error: documentError } = await supabaseService
      .from("company_documents")
      .select("*")
      .eq("id", params.documentId)
      .eq("company_id", companyProfile.id)
      .single();

    if (documentError || !document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 },
      );
    }

    // 5. Delete File from Storage
    const { error: storageError } = await supabaseService.storage
      .from("company-documents")
      .remove([document.file_path]);

    if (storageError) {
      console.error("Error deleting file from storage:", storageError);
      return NextResponse.json(
        { error: "Failed to delete file" },
        { status: 500 },
      );
    }

    // 6. Delete Document Record
    const { error: deleteError } = await supabaseService
      .from("company_documents")
      .delete()
      .eq("id", params.documentId)
      .eq("company_id", companyProfile.id);

    if (deleteError) {
      console.error("Error deleting document record:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete document record" },
        { status: 500 },
      );
    }

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error(
      "Unexpected error in DELETE /api/company/documents/[documentId]:",
      error,
    );
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}

export const DELETE = (
  req: NextRequest,
  ctx: { params: { documentId: string } }
) =>
  createApiHandler(
    z.object({}),
    (r, a, d, services) => handleDelete(r, ctx.params, a, services),
    { requireAuth: true }
  )(req);
