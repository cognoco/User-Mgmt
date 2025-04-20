import * as SupabaseSSR from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Define paths that require authentication
const protectedPaths = ['/profile', '/settings', '/complete-profile']; 
// Define public paths that authenticated users maybe shouldn't see (optional)
const publicOnlyPaths = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create a Supabase client configured to use cookies
  const supabase = SupabaseSSR.createMiddlewareClient({
    req,
    res,
  }, {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });

  // Refresh session if expired - important!
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Middleware getSession error:', error);
    // Allow request to proceed but session might be invalid
    return res; 
  }

  const { pathname } = req.nextUrl;

  // Check if the current path requires authentication
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected && !session) {
    // Redirect unauthenticated users trying to access protected paths to login
    console.log(`Redirecting unauthenticated user from ${pathname} to /login`);
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', pathname); // Optional: add redirect origin
    return NextResponse.redirect(redirectUrl);
  }

  // Optional: Redirect authenticated users away from login/register pages
  if (session && publicOnlyPaths.some(path => pathname.startsWith(path))) {
    console.log(`Redirecting authenticated user from ${pathname} to /`);
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Allow the request to proceed
  return res;
}

// Configure the middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     *
     * Apply middleware to root and other relevant paths.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)', // Run on most paths, including '/', handle public/auth redirects inside
    // Explicitly include paths needing protection (redundant if first line is broad enough, but safe to keep)
    '/profile/:path*',
    '/settings/:path*',
    '/complete-profile/:path*',
    // Add back explicit matches for auth pages if you want middleware to run there for redirects
    '/login',
    '/register',
    '/reset-password',
    '/update-password',
    '/verify-email',
    '/check-email',
  ],
}; 