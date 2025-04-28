import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);

  // Add request time to headers (for debugging)
  requestHeaders.set('x-request-time', new Date().toISOString());

  // Get the response
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // API routes should have CORS headers
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  }

  return response;
}

// Only run middleware on API routes
export const config = {
  matcher: '/api/:path*',
};