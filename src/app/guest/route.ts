import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.set('guest_mode', 'true', {
    path: '/',
    maxAge: 31536000,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  // Seed flag — client will check this on mount and seed demo items
  cookieStore.set('guest_seed_demo', 'true', {
    path: '/',
    maxAge: 600, // 10 min — single-use flag
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  const redirectUrl = new URL('/app', request.url);
  return NextResponse.redirect(redirectUrl);
}
