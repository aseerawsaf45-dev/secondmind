import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (userId) {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  const cookieStore = await cookies();
  cookieStore.set('guest_mode', 'true', {
    path: '/',
    maxAge: 31536000,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  cookieStore.delete('guest_seed_demo');

  const redirectUrl = new URL('/app', request.url);
  return NextResponse.redirect(redirectUrl);
}
