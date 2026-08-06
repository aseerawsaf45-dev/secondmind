import { currentUser } from '@clerk/nextjs/server';
import Dashboard from './Dashboard';

export default async function HomePage() {
  const user = await currentUser();

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
