/**
 * CORS Configuration for Supabase Edge Functions
 * 
 * This module provides common CORS headers that can be used across
 * all Supabase Edge Functions to handle cross-origin requests properly.
 */

/**
 * Standard CORS headers for Supabase Edge Functions
 * These headers allow the function to be called from web browsers
 * and handle preflight OPTIONS requests
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

/**
 * Creates a Response with CORS headers for preflight requests
 * 
 * @param status - HTTP status code (default: 200)
 * @returns Response object with CORS headers
 */
export function createCorsResponse(status: number = 200): Response {
  return new Response('ok', { 
    headers: corsHeaders,
    status 
  });
}

/**
 * Creates a JSON Response with CORS headers
 * 
 * @param data - Data to be serialized as JSON
 * @param status - HTTP status code (default: 200)
 * @returns Response object with JSON content and CORS headers
 */
export function createJsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    headers: { 
      ...corsHeaders, 
      'Content-Type': 'application/json' 
    },
    status,
  });
}

/**
 * Creates an error Response with CORS headers
 * 
 * @param message - Error message
 * @param status - HTTP status code (default: 500)
 * @returns Response object with error and CORS headers
 */
export function createErrorResponse(message: string, status: number = 500): Response {
  return createJsonResponse({ error: message }, status);
}