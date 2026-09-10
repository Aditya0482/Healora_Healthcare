import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiting map for edge requests
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Periodic cleanup of expired rate limit entries every 5 minutes
let lastCleanup = Date.now();
function cleanupRateLimits() {
  const now = Date.now();
  if (now - lastCleanup > 5 * 60 * 1000) {
    lastCleanup = now;
    rateLimitMap.forEach((entry, key) => {
      if (now > entry.resetTime) {
        rateLimitMap.delete(key);
      }
    });
  }
}

function checkRateLimit(ip: string, route: string, maxRequests: number, windowMs: number): boolean {
  cleanupRateLimits();
  const now = Date.now();
  const key = `${ip}:${route}`;
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

function decodeJwtPayload(token: string): { userId?: string; email?: string; role?: string; exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = atob(base64);
    const payload = JSON.parse(jsonStr);

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = req.ip || req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

  // 1. RATE LIMITING FOR SENSITIVE ENDPOINTS
  if (pathname === '/api/auth/login') {
    const allowed = checkRateLimit(ip, 'login', 10, 5 * 60 * 1000); // 10 attempts per 5 mins
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts from this IP. Please wait 5 minutes before trying again.' },
        { status: 429 }
      );
    }
  }

  if (pathname === '/api/auth/register') {
    const allowed = checkRateLimit(ip, 'register', 5, 10 * 60 * 1000); // 5 registers per 10 mins
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many registration requests. Please wait 10 minutes.' },
        { status: 429 }
      );
    }
  }

  if (pathname === '/api/auth/forgot-password') {
    const allowed = checkRateLimit(ip, 'forgot-password', 5, 10 * 60 * 1000); // 5 requests per 10 mins
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many password reset attempts. Please wait 10 minutes.' },
        { status: 429 }
      );
    }
  }

  if (pathname === '/api/orders/create' || pathname === '/api/orders/retry-payment') {
    const allowed = checkRateLimit(ip, 'orders-create', 15, 5 * 60 * 1000); // 15 orders per 5 mins
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many order requests. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }
  }

  if (pathname === '/api/contact') {
    const allowed = checkRateLimit(ip, 'contact', 8, 10 * 60 * 1000); // 8 contact submissions per 10 mins
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please wait before submitting again.' },
        { status: 429 }
      );
    }
  }

  // 2. ROUTE AUTHORIZATION & ACCESS CONTROL
  const token = req.cookies.get('auth_token')?.value;
  const payload = token ? decodeJwtPayload(token) : null;

  // Protect Admin Web Pages (/admin, /admin/*)
  if (pathname.startsWith('/admin')) {
    if (!payload || !['SUPER_ADMIN', 'INVENTORY_MANAGER'].includes(payload.role || '')) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Admin API Routes (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    if (!payload || !['SUPER_ADMIN', 'INVENTORY_MANAGER', 'SUPPORT'].includes(payload.role || '')) {
      return NextResponse.json({ error: 'Access denied. Administrator session required.' }, { status: 403 });
    }
  }

  // Protect Customer Account Pages (/account, /account/*)
  if (pathname.startsWith('/account')) {
    if (!payload) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/account/:path*',
    '/api/auth/:path*',
    '/api/orders/create',
    '/api/orders/retry-payment',
    '/api/contact',
  ],
};
