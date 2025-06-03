import { NextRequest } from "next/server";
import { z } from "zod";
import { getServiceSupabase } from "@/lib/database/supabase";
import { getApiCompanyService } from "@/services/company/factory";
import { type RouteAuthContext } from "@/middleware/auth";
import {
  createMiddlewareChain,
  errorHandlingMiddleware,
  routeAuthMiddleware,
  rateLimitMiddleware,
  validationMiddleware,
} from "@/middleware/createMiddlewareChain";
import { withSecurity } from "@/middleware/with-security";
import {
  createCreatedResponse,
  createPaginatedResponse,
  createValidationError,
  createNotFoundError,
  createServerError,
  ApiError,
  ERROR_CODES,
} from "@/lib/api/common";

// Document upload schema
const DocumentUploadSchema = z.object({
  type: z.enum(["registration", "tax", "other"]),
  file: z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
    base64: z.string(),
  }),
});

type DocumentUploadRequest = z.infer<typeof DocumentUploadSchema>;

const baseMiddleware = createMiddlewareChain([
  rateLimitMiddleware(),
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
]);

const postMiddleware = createMiddlewareChain([
  rateLimitMiddleware(),
  errorHandlingMiddleware(),
  routeAuthMiddleware(),
  validationMiddleware(DocumentUploadSchema),
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

// --- POST Handler for uploading company documents ---
async function handlePost(
  _request: NextRequest,
  auth: RouteAuthContext,
  data: DocumentUploadRequest,
) {
  try {
    const supabaseService = getServiceSupabase();
    const userId = auth.userId!;

    const companyService = getApiCompanyService();
    const companyProfile = await companyService.getProfileByUserId(userId);

    if (!companyProfile) {
      throw createNotFoundError("Company profile");
    }

    const { type, file } = data;

    // 5. Validate File
    if (file.size > MAX_FILE_SIZE) {
      throw createValidationError("File size exceeds limit");
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw createValidationError("Invalid file type");
    }

    // 6. Upload File to Storage
    const fileBuffer = Buffer.from(file.base64.split(",")[1], "base64");
    const filePath = `companies/${companyProfile.id}/documents/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabaseService.storage
      .from("company-documents")
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("File upload error:", uploadError);
      throw createServerError("Failed to upload file");
    }

    // 7. Create Document Record
    const { data: document, error: documentError } = await supabaseService
      .from("company_documents")
      .insert({
        company_id: companyProfile.id,
        type,
        filename: file.name,
        file_path: filePath,
        mime_type: file.type,
        size_bytes: file.size,
        uploaded_by: userId,
        status: "pending",
      })
      .select()
      .single();

    if (documentError) {
      // Cleanup uploaded file if record creation fails
      await supabaseService.storage
        .from("company-documents")
        .remove([filePath]);

      console.error("Document record creation error:", documentError);
      throw createServerError("Failed to create document record");
    }

    return createCreatedResponse(document);
  } catch (error) {
    console.error("Unexpected error in POST /api/company/documents:", error);
    throw createServerError("An internal server error occurred");
  }
}

// --- GET Handler for fetching company documents ---
async function handleGet(request: NextRequest, auth: RouteAuthContext) {
  try {
    const supabaseService = getServiceSupabase();
    const userId = auth.userId!;

    // 3. Get Company Profile
    const companyService = getApiCompanyService();
    const companyProfile = await companyService.getProfileByUserId(userId);

    if (!companyProfile) {
      throw createNotFoundError("Company profile");
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "20"),
      100,
    );
    const type = url.searchParams.get("type") || undefined;

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    let query = supabaseService
      .from("company_documents")
      .select("*", { count: "exact" })
      .eq("company_id", companyProfile.id)
      .order("created_at", { ascending: false });

    if (type) {
      query = query.eq("type", type);
    }

    const {
      data: documents,
      error: documentsError,
      count,
    } = await Promise.race([
      query.range(startIndex, endIndex),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Database query timeout")), 5000),
      ),
    ]);

    if (documentsError) {
      console.error("Error fetching documents:", documentsError);
      throw createServerError("Failed to fetch documents");
    }

    const generateSignedUrl = async (doc: any) => {
      try {
        const { data, error: signedUrlError } = await Promise.race([
          supabaseService.storage
            .from("company-documents")
            .createSignedUrl(doc.file_path, 3600),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("Storage operation timeout")),
              3000,
            ),
          ),
        ]);

        if (signedUrlError || !data) {
          console.error("Error getting signed URL:", signedUrlError);
          return {
            ...doc,
            signedUrl: null,
            error: signedUrlError?.message || "Failed to generate URL",
          };
        }

        return {
          ...doc,
          signedUrl: data.signedUrl,
        };
      } catch (error) {
        console.error(
          `Error generating signed URL for ${doc.file_path}:`,
          error,
        );
        return {
          ...doc,
          signedUrl: null,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    };

    const documentsWithUrls = [] as any[];
    const batchSize = 5;
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const results = await Promise.all(batch.map(generateSignedUrl));
      documentsWithUrls.push(...results);
    }

    const totalItems = count || 0;
    const totalPages = totalItems ? Math.ceil(totalItems / limit) : 0;
    return createPaginatedResponse(documentsWithUrls, {
      page,
      pageSize: limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/company/documents:", error);
    throw createServerError("An internal server error occurred");
  }
}

export const POST = withSecurity((req: NextRequest) =>
  postMiddleware((r, auth, data) => handlePost(r, auth, data))(req)
);

export const GET = withSecurity((req: NextRequest) =>
  baseMiddleware((r, auth) => handleGet(r, auth))(req)
);
