import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceSupabase } from "@/lib/database/supabase";
import { getApiCompanyService } from "@/services/company/factory";
import { logUserAction } from "@/lib/audit/auditLogger";
import { type RouteAuthContext } from "@/middleware/auth";
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware,
  rateLimitMiddleware,
  validationMiddleware,
} from "@/middleware/createMiddlewareChain";
import { withSecurity } from "@/middleware/with-security";

// Company Profile Schema
const CompanyProfileSchema = z.object({
  name: z.string().min(2).max(100),
  legal_name: z.string().min(2).max(100),
  registration_number: z.string().optional(),
  tax_id: z.string().optional(),
  website: z.string().url().optional(),
  industry: z.string().min(2).max(50),
  size_range: z.enum([
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "501-1000",
    "1000+",
  ]),
  founded_year: z.number().int().min(1800).max(new Date().getFullYear()),
  description: z.string().max(1000).optional(),
});

type CompanyProfileRequest = z.infer<typeof CompanyProfileSchema>;

// Company Profile Update Schema - more permissive than creation schema
const CompanyProfileUpdateSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    legal_name: z.string().min(2).max(100).optional(),
    registration_number: z.string().optional(),
    tax_id: z.string().optional(),
    website: z.string().url().optional(),
    industry: z.string().min(2).max(50).optional(),
    size_range: z
      .enum(["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"])
      .optional(),
    founded_year: z
      .number()
      .int()
      .min(1800)
      .max(new Date().getFullYear())
      .optional(),
    description: z.string().max(1000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

type CompanyProfileUpdateRequest = z.infer<typeof CompanyProfileUpdateSchema>;

const baseMiddleware = createMiddlewareChain([
  rateLimitMiddleware(),
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
]);

async function handlePost(
  request: NextRequest,
  auth: RouteAuthContext,
  data?: CompanyProfileRequest,
) {
  const ipAddress = request.ip;
  const userAgent = request.headers.get("user-agent");
  let userIdForLogging: string | null = null;

  try {
    const supabaseService = getServiceSupabase();
    const userId = auth.userId!;
    userIdForLogging = userId;

    const companyService = getApiCompanyService();
    const existingProfile = await companyService.getProfileByUserId(userId);

    if (existingProfile) {
      await logUserAction({
        userId: userIdForLogging,
        action: "COMPANY_PROFILE_CREATE_DUPLICATE_ATTEMPT",
        status: "FAILURE",
        ipAddress,
        userAgent,
        targetResourceType: "company_profile",
        targetResourceId: userIdForLogging,
        details: { existingProfileId: existingProfile.id },
      });
      return NextResponse.json(
        { error: "User already has a company profile" },
        { status: 409 },
      );
    }

    const { data: profile, error: createError } = await supabaseService
      .from("company_profiles")
      .insert({
        ...data,
        user_id: userId,
        status: "pending",
        verified: false,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating company profile:", createError);
      await logUserAction({
        userId: userIdForLogging,
        action: "COMPANY_PROFILE_CREATE_FAILURE",
        status: "FAILURE",
        ipAddress,
        userAgent,
        targetResourceType: "company_profile",
        targetResourceId: userIdForLogging,
        details: { reason: createError.message, code: createError.code },
      });
      return NextResponse.json(
        { error: "Failed to create company profile" },
        { status: 500 },
      );
    }

    await logUserAction({
      userId: userIdForLogging,
      action: "COMPANY_PROFILE_CREATE_SUCCESS",
      status: "SUCCESS",
      ipAddress,
      userAgent,
      targetResourceType: "company_profile",
      targetResourceId: profile.id,
      details: { companyName: profile.name },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Unexpected error in POST /api/company/profile:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    await logUserAction({
      userId: userIdForLogging,
      action: "COMPANY_PROFILE_CREATE_UNEXPECTED_ERROR",
      status: "FAILURE",
      ipAddress,
      userAgent,
      targetResourceType: "company_profile",
      targetResourceId: userIdForLogging,
      details: { error: message },
    });
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}
// Update middleware chain to include validation
const postMiddleware = createMiddlewareChain([
  rateLimitMiddleware(),
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
  validationMiddleware(CompanyProfileSchema),
]);

export const POST = withSecurity((req: NextRequest) =>
  postMiddleware((r, auth, data) => handlePost(r, auth, data))(req)
);

async function handleGet(_request: NextRequest, auth: RouteAuthContext) {
  try {
    const userId = auth.userId!;
    const companyService = getApiCompanyService();
    const profile = await companyService.getProfileByUserId(userId);

    if (!profile) {
      return NextResponse.json(
        { error: "Company profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Unexpected error in GET /api/company/profile:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}

export const GET = withSecurity((req: NextRequest) =>
  baseMiddleware((r, auth) => handleGet(r, auth))(req)
);

async function handlePut(
  request: NextRequest,
  auth: RouteAuthContext,
  data: CompanyProfileUpdateRequest,
) {
  // Get IP and User Agent early
  const ipAddress = request.ip;
  const userAgent = request.headers.get("user-agent");
  let userIdForLogging: string | null = null;
  let companyProfileIdForLogging: string | null = null;

  try {
    const supabaseService = getServiceSupabase();
    const userId = auth.userId!;
    userIdForLogging = userId;

    const companyService = getApiCompanyService();
    const existingProfile = await companyService.getProfileByUserId(userId);

    if (!existingProfile) {
      // Log attempt to update non-existent profile
      await logUserAction({
        userId: userIdForLogging,
        action: "COMPANY_PROFILE_UPDATE_NOT_FOUND",
        status: "FAILURE",
        ipAddress: ipAddress,
        userAgent: userAgent,
        targetResourceType: "company_profile",
        targetResourceId: userIdForLogging, // Target is the user
        details: { reason: "Company profile not found for user" },
      });
      return NextResponse.json(
        { error: "Company profile not found" },
        { status: 404 },
      );
    }
    companyProfileIdForLogging = existingProfile.id; // Store for logging

    // 4. Update Profile
    const fieldsToUpdate = data;
    const { data: updatedProfile, error: updateError } = await supabaseService
      .from("company_profiles")
      .update({
        ...fieldsToUpdate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", companyProfileIdForLogging) // Use the fetched ID
      .select()
      .single();

    if (updateError) {
      console.error("Error updating company profile:", updateError);
      // Log update failure
      await logUserAction({
        userId: userIdForLogging,
        action: "COMPANY_PROFILE_UPDATE_FAILURE",
        status: "FAILURE",
        ipAddress: ipAddress,
        userAgent: userAgent,
        targetResourceType: "company_profile",
        targetResourceId: companyProfileIdForLogging,
        details: {
          reason: updateError.message,
          code: updateError.code,
          attemptedFields: Object.keys(fieldsToUpdate), // Log which fields were attempted
        },
      });
      return NextResponse.json(
        { error: "Failed to update company profile" },
        { status: 500 },
      );
    }

    // Log successful update
    await logUserAction({
      userId: userIdForLogging,
      action: "COMPANY_PROFILE_UPDATE_SUCCESS",
      status: "SUCCESS",
      ipAddress: ipAddress,
      userAgent: userAgent,
      targetResourceType: "company_profile",
      targetResourceId: companyProfileIdForLogging,
      details: { updatedFields: Object.keys(fieldsToUpdate) }, // Log which fields were updated
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("Unexpected error in PUT /api/company/profile:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    // Log unexpected error
    await logUserAction({
      userId: userIdForLogging, // May be null
      action: "COMPANY_PROFILE_UPDATE_UNEXPECTED_ERROR",
      status: "FAILURE",
      ipAddress: ipAddress,
      userAgent: userAgent,
      targetResourceType: "company_profile",
      targetResourceId: companyProfileIdForLogging, // May be null
      details: { error: message },
    });
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}

// Update middleware chain for PUT to include its specific validation schema
const putMiddleware = createMiddlewareChain([
  rateLimitMiddleware(),
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
  validationMiddleware(CompanyProfileUpdateSchema),
]);

export const PUT = withSecurity((req: NextRequest) =>
  putMiddleware((r, auth, data) => handlePut(r, auth, data))(req)
);

async function handleDelete(request: NextRequest, auth: RouteAuthContext) {
  // Get IP and User Agent early
  const ipAddress = request.ip;
  const userAgent = request.headers.get("user-agent");
  let userIdForLogging: string | null = null;
  let companyProfileIdForLogging: string | null = null;

  try {
    const supabaseService = getServiceSupabase();
    const userId = auth.userId!;
    userIdForLogging = userId;

    const companyService = getApiCompanyService();
    const profileToDelete = await companyService.getProfileByUserId(userId);

    if (!profileToDelete) {
      // Log attempt to delete non-existent profile
      await logUserAction({
        userId: userIdForLogging,
        action: "COMPANY_PROFILE_DELETE_NOT_FOUND",
        status: "FAILURE",
        ipAddress: ipAddress,
        userAgent: userAgent,
        targetResourceType: "company_profile",
        targetResourceId: userIdForLogging, // Target is the user
        details: { reason: "Company profile not found to delete" },
      });
      return NextResponse.json(
        { error: "Company profile not found to delete" },
        { status: 404 },
      );
    }
    companyProfileIdForLogging = profileToDelete.id;

    // Optional: Delete related data (e.g., documents, addresses) - requires careful handling
    // Example: Deleting associated documents from Storage
    // Fetch document paths first
    const { data: documents /*, error: documentsError */ } =
      await supabaseService // Commented out unused error variable
        .from("company_documents")
        .select("storage_path")
        .eq("company_id", companyProfileIdForLogging);

    if (documents && documents.length > 0) {
      const filePaths = documents
        .map((doc) => doc.storage_path)
        .filter((path) => path);
      if (filePaths.length > 0) {
        // Delete from Storage
        const { error: storageError } = await supabaseService.storage
          .from("company-documents") // Replace with your actual bucket name
          .remove(filePaths);
        if (storageError) {
          console.error("Error deleting documents from storage:", storageError);
          // Decide if this is a fatal error or just log and continue
        }
        // Delete from DB table
        const { error: dbDeleteError } = await supabaseService
          .from("company_documents")
          .delete()
          .eq("company_id", companyProfileIdForLogging);
        if (dbDeleteError) {
          console.error(
            "Error deleting document records from DB:",
            dbDeleteError,
          );
          // Decide if this is a fatal error or just log and continue
        }
      }
    }

    // 4. Delete the Company Profile
    const { error: deleteError } = await supabaseService
      .from("company_profiles")
      .delete()
      .eq("id", companyProfileIdForLogging);

    if (deleteError) {
      console.error("Error deleting company profile:", deleteError);
      // Log deletion failure
      await logUserAction({
        userId: userIdForLogging,
        action: "COMPANY_PROFILE_DELETE_FAILURE",
        status: "FAILURE",
        ipAddress: ipAddress,
        userAgent: userAgent,
        targetResourceType: "company_profile",
        targetResourceId: companyProfileIdForLogging,
        details: {
          reason: deleteError.message,
          code: deleteError.code,
        },
      });
      return NextResponse.json(
        { error: "Failed to delete company profile" },
        { status: 500 },
      );
    }

    // Log successful deletion
    await logUserAction({
      userId: userIdForLogging,
      action: "COMPANY_PROFILE_DELETE_SUCCESS",
      status: "SUCCESS",
      ipAddress: ipAddress,
      userAgent: userAgent,
      targetResourceType: "company_profile",
      targetResourceId: companyProfileIdForLogging,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/company/profile:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    // Log unexpected error
    await logUserAction({
      userId: userIdForLogging, // May be null
      action: "COMPANY_PROFILE_DELETE_UNEXPECTED_ERROR",
      status: "FAILURE",
      ipAddress: ipAddress,
      userAgent: userAgent,
      targetResourceType: "company_profile",
      targetResourceId: companyProfileIdForLogging, // May be null
      details: { error: message },
    });
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 },
    );
  }
}

export const DELETE = withSecurity((req: NextRequest) =>
  baseMiddleware((r, auth) => handleDelete(r, auth))(req)
);
