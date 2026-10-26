import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';
import { checkAuthRateLimit, checkApiRateLimit } from '@/lib/rate-limit';

const isAuthRoute = createRouteMatcher(['/login(.*)', '/signup(.*)', '/auth(.*)', '/guest']);
const isExtractApi = createRouteMatcher(['/api/extract(.*)']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const pathname = req.nextUrl.pathname.toLowerCase();

  // 0. Sensitive File & Scanner Probe Shield (Blocks .env, .git, .aws, .pem, etc.)
  if (
    pathname.includes('/.env') ||
    pathname.endsWith('.env') ||
    pathname.includes('/.git') ||
    pathname.includes('/.aws') ||
    pathname.includes('/.ssh') ||
    pathname.includes('/.ds_store') ||
    pathname.endsWith('.pem') ||
    pathname.endsWith('.key') ||
    pathname.endsWith('.sql') ||
    pathname.endsWith('.bak')
  ) {
    return new NextResponse('Not Found', {
      status: 404,
      headers: {
        'X-Robots-Tag': 'noindex, nofollow',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  let sessionUserId: string | null = null;
  try {
    const session = await auth();
    sessionUserId = session?.userId ?? null;
  } catch {
    // In offline environments or network interruptions, allow request to pass through
  }

  // If user is already authenticated and visits '/', '/login', '/signup', '/try', or '/guest', route them directly to dashboard
  if (sessionUserId && (
    req.nextUrl.pathname === '/' ||
    req.nextUrl.pathname === '/login' ||
    req.nextUrl.pathname === '/signup' ||
    req.nextUrl.pathname === '/try' ||
    req.nextUrl.pathname === '/guest'
  )) {
    const appUrl = new URL('/app', req.url);
    const response = NextResponse.redirect(appUrl);
    if (req.cookies.has('guest_mode') || req.cookies.has('guest_seed_demo')) {
      response.cookies.delete('guest_mode');
      response.cookies.delete('guest_seed_demo');
    }
    return response;
  }

  // 1. Rate limiting on Auth Routes (30 req/min per IP, excluding router prefetches)
  const isPrefetch =
    req.headers.get('next-router-prefetch') === '1' ||
    req.headers.get('purpose') === 'prefetch';

  if (isAuthRoute(req) && !isPrefetch) {
    const rateCheck = checkAuthRateLimit(ip);
    if (!rateCheck.success) {
      const acceptsHtml = req.headers.get('accept')?.includes('text/html');
      if (acceptsHtml) {
        return new NextResponse(
          `<!DOCTYPE html><html><body style="background:#040408;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><div style="text-align:center;padding:24px;border:1px solid rgba(255,255,255,0.1);border-radius:12px;background:rgba(255,255,255,0.03);max-width:400px;"><h2 style="color:#f87171;margin-bottom:8px;">Too Many Attempts</h2><p style="color:rgba(255,255,255,0.7);font-size:14px;line-height:1.5;">Too many authentication attempts. Please wait ${rateCheck.reset} seconds before trying again.</p><a href="/login" style="display:inline-block;margin-top:12px;color:#38bdf8;text-decoration:none;font-size:13px;">Retry Login &rarr;</a></div></body></html>`,
          {
            status: 429,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Retry-After': String(rateCheck.reset),
            },
          }
        );
      }

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

  const response = NextResponse.next();

  // 4. Automatically purge obsolete guest cookies whenever a verified user session exists
  if (sessionUserId && (req.cookies.has('guest_mode') || req.cookies.has('guest_seed_demo'))) {
    response.cookies.delete('guest_mode');
    response.cookies.delete('guest_seed_demo');
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
