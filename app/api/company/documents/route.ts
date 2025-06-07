import { NextRequest } from "next/server";
import { z } from "zod";
import { getApiCompanyService } from "@/services/company/factory";
import { type RouteAuthContext } from "@/middleware/auth";
import { withSecurity } from "@/middleware/withSecurity";
import { createApiHandler } from "@/lib/api/routeHelpers";
import {
  createSuccessResponse,
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
    const companyService = getApiCompanyService();
    const userId = auth.userId!;

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

    const document = await companyService.uploadDocument(companyProfile.id, filePath, {
      type,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      uploadedBy: userId,
    });

    return createSuccessResponse(document, 201);
  } catch (error) {
    console.error("Unexpected error in POST /api/company/documents:", error);
    throw createServerError("An internal server error occurred");
  }
}

// --- GET Handler for fetching company documents ---
async function handleGet(
  request: NextRequest,
  auth: RouteAuthContext,
  _data: unknown,
) {
  try {
    const companyService = getApiCompanyService();
    const userId = auth.userId!;

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

    const { documents, count } = await companyService.listDocuments(companyProfile.id, {
      start: startIndex,
      end: endIndex,
      type,
    });

    const generateSignedUrl = async (doc: any) => {
      const url = await companyService.createSignedUrl(doc.file_path, 3600);
      return { ...doc, signedUrl: url };
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
  createApiHandler(
    DocumentUploadSchema,
    (r, a, d) => handlePost(r, a, d),
    { requireAuth: true }
  )(req)
);

export const GET = withSecurity((req: NextRequest) =>
  createApiHandler(
    z.object({}),
    (r, a, d) => handleGet(r as NextRequest, a, d),
    { requireAuth: true }
  )(req)
);
