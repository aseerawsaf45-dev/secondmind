import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (userId) {
    return NextResponse.redirect(new URL('/app', request.url));
  }
  const guestUrl = new URL('/guest', request.url);
  return NextResponse.redirect(guestUrl);
}
