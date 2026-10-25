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
  // A verified user session MUST ALWAYS take precedence over any guest/offline cookie.
  let user = null;
  let isClerkOffline = false;
  try {
    user = await currentUser();
  } catch (e: any) {
    console.warn('[App] Failed to fetch current user from Clerk (possibly offline):', e?.message || e);
    isClerkOffline = true;
  }

  // 2. Guest or offline mode
  const isGuest = !user && cookieStore.get('guest_mode')?.value === 'true';
  const isExplicitOffline = !user && cookieStore.get('offline_mode')?.value === 'true';

  // If there's no user, no guest cookie, no offline flag, and Clerk didn't fail due to offline:
  if (!user && !isGuest && !isExplicitOffline && !isClerkOffline) {
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
  } else {
    // Offline mode: Dashboard will load cached memories from device storage
    activeUser = {
      id: 'offline-user',
      email: 'offline@local.memory',
      fullName: 'Offline Mode',
    };
  }

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg-base)' }} />}>
      <Dashboard user={activeUser} />
    </Suspense>
  );
}
