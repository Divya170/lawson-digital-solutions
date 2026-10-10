import { NextRequest, NextResponse } from 'next/server';

/**
 * Staff portal guard. Anything under /staff (except the sign-in page) needs a session cookie.
 * The cookie itself is verified by the API on every request; this just avoids rendering
 * the portal shell for visitors who were never signed in.
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname === '/staff/login') return NextResponse.next();
  if (!req.cookies.get('lds_staff')) {
    const url = req.nextUrl.clone();
    url.pathname = '/staff/login';
    url.search = pathname === '/staff' ? '' : `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/staff', '/staff/:path*'] };
