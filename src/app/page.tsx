import { currentUser } from '@clerk/nextjs/server';
import Dashboard from './Dashboard';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function HomePage() {
  const user = await currentUser();
  const cookieStore = await cookies();
  const isGuest = cookieStore.get('guest_mode')?.value === 'true';

  if (!user && !isGuest) {
    redirect('/login');
  }

  let activeUser = null;
  if (user) {
    activeUser = {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
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
