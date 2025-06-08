// Type declarations for Supabase Edge Functions

declare module '@supabase/supabase-js' {
  export function createClient(supabaseUrl: string, supabaseKey: string, options?: any): any;
  export interface SupabaseClient {
    auth: {
      admin: {
        listUsers(options?: any): Promise<any>;
        deleteUser(userId: string): Promise<any>;
      };
    };
  }
}

declare module '../_shared/cors.ts' {
  export const corsHeaders: Record<string, string>;
  export function createJsonResponse(data: any, status?: number): Response;
  export function createErrorResponse(message: string, status?: number): Response;
}

declare const Deno: any;
