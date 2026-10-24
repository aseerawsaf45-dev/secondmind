import { currentUser } from '@clerk/nextjs/server';
import Dashboard from '../Dashboard';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Suspense } from 'react';

export const metadata = {
  title: 'SecondMind — Your AI Memory Dashboard',
  description: 'Your personal AI-powered knowledge base. Save anything, remember everything.',
};

export default async function AppPage() {
  const cookieStore = await cookies();

  // 1. Always check authenticated Clerk session first.
  // A verified user session MUST ALWAYS take precedence over any guest cookie.
  let user = null;
  try {
    user = await currentUser();
  } catch (e) {
    console.warn('[App] Failed to fetch current user from Clerk:', e);
  }

  // 2. Guest mode is only valid when there is NO authenticated user.
  const isGuest = !user && cookieStore.get('guest_mode')?.value === 'true';

  if (!user && !isGuest) {
    redirect('/login');
  }

  let activeUser = null;
  if (user) {
    activeUser = {
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
      avatarUrl: user.imageUrl,
    };
  } else if (isGuest) {
    activeUser = {
      id: 'guest',
      email: 'guest@local.memory',
      fullName: 'Guest User',
    };
  }

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg-base)' }} />}>
      <Dashboard user={activeUser} />
    </Suspense>
  );
}
