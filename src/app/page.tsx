import { currentUser } from '@clerk/nextjs/server';
import Dashboard from './Dashboard';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const user = await currentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <Dashboard
      user={
        user
          ? {
              id: user.id,
              email: user.emailAddresses[0]?.emailAddress,
              fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
              avatarUrl: user.imageUrl,
            }
          : null
      }
    />
  );
}
