import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const guestUrl = new URL('/guest', request.url);
  return NextResponse.redirect(guestUrl);
}
