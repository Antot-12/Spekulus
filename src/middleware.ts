import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getPageStatus } from '@/lib/db/actions';

// Add any paths that should be excluded from maintenance checks
const EXCLUDED_PATHS = ['/api/', '/admin', '/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for excluded paths (API, admin, etc.)
  if (EXCLUDED_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  
  // Check per-page maintenance status
  try {
    const pageStatus = await getPageStatus(pathname);

    if (pageStatus === 'maintenance') {
      const url = request.nextUrl.clone();
      url.pathname = '/maintenance';
      return NextResponse.rewrite(url);
    }
  } catch (error) {
    // If the database call fails, it's safer to let the page load
    // than to block access. The error will be logged by the action.
    console.error(`Middleware database error for path ${pathname}:`, error);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
