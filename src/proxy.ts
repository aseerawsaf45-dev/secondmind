import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';
import { checkAuthRateLimit, checkApiRateLimit } from '@/lib/rate-limit';

const isAuthRoute = createRouteMatcher(['/login(.*)', '/signup(.*)', '/auth(.*)']);
const isExtractApi = createRouteMatcher(['/api/extract(.*)']);

export default clerkMiddleware(async (_auth, req: NextRequest) => {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  // 1. Rate limiting on Auth Routes (5 req/min per IP)
  if (isAuthRoute(req)) {
    const rateCheck = checkAuthRateLimit(ip);
    if (!rateCheck.success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many authentication attempts. Please wait a minute and try again.',
          retryAfter: rateCheck.reset,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rateCheck.reset),
          },
        }
      );
    }
  }

  // 2. Rate limiting on Extraction API (30 req/min per IP)
  if (isExtractApi(req)) {
    const rateCheck = checkApiRateLimit(ip);
    if (!rateCheck.success) {
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded. Please slow down your requests.',
          retryAfter: rateCheck.reset,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rateCheck.reset),
          },
        }
      );
    }
  }

  // 3. CORS origin restriction for internal API routes
  if (req.nextUrl.pathname.startsWith('/api/') && !req.nextUrl.pathname.startsWith('/api/webhooks/')) {
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host && !originHost.endsWith('.vercel.app')) {
          return new NextResponse(
            JSON.stringify({ error: 'Cross-origin request blocked.' }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      } catch {
        // Invalid origin format
        return new NextResponse(
          JSON.stringify({ error: 'Invalid origin header.' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
