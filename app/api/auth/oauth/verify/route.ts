import { NextResponse } from "next/server";
import { z } from "zod";
import { OAuthProvider } from "@/types/oauth";
import { getApiOAuthService } from "@/services/oauth/factory";

const verifySchema = z.object({
  providerId: z.nativeEnum(OAuthProvider),
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { providerId, email } = verifySchema.parse(body);

    const service = getApiOAuthService();
    const result = await service.verifyProviderEmail(providerId, email);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status ?? 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to verify provider" },
      { status: 400 },
    );
  }
}
