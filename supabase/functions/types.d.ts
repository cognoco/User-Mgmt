// Type declarations for Supabase Edge Functions

// Note: Module augmentation removed as it was interfering with actual SupabaseClient types
// If you need to extend SupabaseClient types, do it properly without overriding the core interface

declare module '../_shared/cors.ts' {
  export const corsHeaders: Record<string, string>;
  export function createJsonResponse(data: any, status?: number): Response;
  export function createErrorResponse(message: string, status?: number): Response;
}

// Minimal Deno global declarations for type checking
declare const Deno: {
  env: {
    get(key: string): string | undefined
  }
  serve(handler: (req: Request) => Response | Promise<Response>): void
};
