import LandingPage from './LandingPage';

export const metadata = {
  title: 'SecondMind — Your AI-Powered Second Brain',
  description:
    'Save anything from the web. AI organizes it, summarizes it, and makes it searchable. Your memory, supercharged.',
  openGraph: {
    title: 'SecondMind — Your AI-Powered Second Brain',
    description: 'Save anything. Remember everything. Let AI do the organizing.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SecondMind' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SecondMind — Your AI-Powered Second Brain',
    description: 'Save anything. Remember everything. Let AI do the organizing.',
    images: ['/og-image.png'],
  },
};

export default function HomePage() {
  return <LandingPage />;
}
