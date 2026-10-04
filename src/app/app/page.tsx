import { currentUser } from '@clerk/nextjs/server';
import Dashboard from '../Dashboard';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export const metadata = {
  title: 'SecondMind — Your AI Memory Dashboard',
  description: 'Your personal AI-powered knowledge base. Save anything, remember everything.',
};

export default async function AppPage() {
  const cookieStore = await cookies();
  const isGuest = cookieStore.get('guest_mode')?.value === 'true';

  let user = null;
  if (!isGuest) {
    try {
      user = await currentUser();
    } catch (e) {
      console.warn('[App] Failed to fetch current user from Clerk:', e);
    }
  }

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

  return <Dashboard user={activeUser} />;
}
