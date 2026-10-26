import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import LandingPage from './LandingPage';

export const metadata = {
  title: 'SecondMind — Your AI-Powered Second Brain',
  description:
    'Save anything from the web. SecondMind organizes it, summarizes key insights, and makes it searchable. Your private second brain.',
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

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'SecondMind',
  operatingSystem: 'Any',
  applicationCategory: 'ProductivityApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description: 'AI-powered second brain and smart bookmark manager. Save anything from the web, remember everything.',
  url: 'https://secondmind-aa.vercel.app',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '1240',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does Guest Mode work without an account?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can test SecondMind immediately with zero friction. We seed sample memories or let you save new ones instantly. Everything is stored locally in your browser with zero tracking. When you decide to create a free account, a single click migrates all your memories to your permanent cloud account.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my data used to train AI models?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Never. SecondMind enforces strict zero-training data boundaries. Your saved URLs, research notes, and personal summaries are solely used to generate answers and insights for your personal workspace.',
      },
    },
    {
      '@type': 'Question',
      name: 'How fast is saving content?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Under 2 seconds. When you paste a URL or press ⌘V anywhere in the app, SecondMind automatically strips clutter, extracts clean markdown, generates concise key takeaways, and assigns relevant tags without requiring manual filing.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I export my data anytime?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! You can export your entire knowledge base as structured JSON at any time with a single click. We never lock your thoughts into our platform.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the AI search and question answering work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Instead of searching through keywords alone, SecondMind uses neural semantic embeddings. When you ask a question like "What did I save about transformer attention?", it retrieves relevant passages across all your links and notes and synthesizes a direct answer with citations.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use keyboard shortcuts?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, SecondMind is built for speed: press ⌘K or Ctrl+K to search and ask questions, ⌘N to create a memory, ⌘V to paste-capture from clipboard anywhere, and ? to see all shortcuts.',
      },
    },
  ],
};

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) {
    redirect('/app');
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <LandingPage />
    </>
  );
}
