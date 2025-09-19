import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

// Basic shape of user inside JWT (adjust if backend changes)
interface JwtUser {
  id: string;
  role: 'buyer' | 'seller' | string;
  username?: string;
  email?: string;
}
interface AccessTokenPayload {
  user?: JwtUser;
  type?: string;
  exp?: number;
  iat?: number;
}

// Routes classification
const PUBLIC_AUTH_ROUTES = ['/login', '/register'];
const HOMEPAGE = '/';
const DASHBOARD_ROOT = '/dashboard';

// Helper: check if path starts with pattern (for grouping like /dashboard/...)
const startsWith = (path: string, prefix: string) =>
  path === prefix || path.startsWith(prefix + '/');

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next.js internals & static files quickly
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(?:.*)$/) // static assets
  ) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get('access_token')?.value;

  // 1. No token: allow homepage + login + register, block others
  if (!accessToken) {
    if (PUBLIC_AUTH_ROUTES.includes(pathname) || pathname === HOMEPAGE) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // With token: decode minimal info
  let payload: AccessTokenPayload | null = null;
  try {
    payload = jwtDecode<AccessTokenPayload>(accessToken);
  } catch (err) {
    // Invalid token → treat as no token
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const role = payload?.user?.role;

  // 2. Buyer rules
  if (role === 'buyer') {
    // Buyer should only access homepage (per requirement) and NOT: login, register, dashboard
    if (startsWith(pathname, DASHBOARD_ROOT)) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    if (PUBLIC_AUTH_ROUTES.includes(pathname)) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    // If trying something else not explicitly allowed (e.g., other pages) redirect to homepage for now
    if (pathname !== HOMEPAGE) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // 3. Seller rules
  if (role === 'seller') {
    // Only allow dashboard (and nested). Block homepage, login, register
    if (PUBLIC_AUTH_ROUTES.includes(pathname) || pathname === HOMEPAGE) {
      return NextResponse.redirect(new URL(DASHBOARD_ROOT, req.url));
    }
    if (!startsWith(pathname, DASHBOARD_ROOT)) {
      // Any other route → force dashboard for now
      return NextResponse.redirect(new URL(DASHBOARD_ROOT, req.url));
    }
    return NextResponse.next();
  }

  // Unknown role or missing role → force login
  return NextResponse.redirect(new URL('/login', req.url));
}

// Matcher: apply middleware to all pages except static assets (granular control above too)
export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
