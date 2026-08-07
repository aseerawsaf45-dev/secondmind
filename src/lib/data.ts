export type ContentType = 'link' | 'note' | 'image' | 'pdf' | 'tweet' | 'video';

export interface Tag {
  name: string;
  color: string;
}

export interface MemoryItem {
  id: string;
  type: ContentType;
  title: string;
  content: string;
  url?: string;
  sourceDomain?: string;
  thumbnailUrl?: string;
  summary: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  relatedIds: string[];
  aiProcessed: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  isSmart: boolean;
  itemCount: number;
  color: string;
  emoji: string;
}

export const TAG_COLORS: Record<string, string> = {
  'AI': '#06565b',
  'Design': '#66a4ac',
  'Research': '#003a44',
  'Business': '#F59E0B',
  'Technology': '#10B981',
  'Productivity': '#3B82F6',
  'Science': '#8B5CF6',
  'Writing': '#F97316',
  'Philosophy': '#6366F1',
  'Psychology': '#84CC16',
  'Marketing': '#EF4444',
  'Finance': '#14B8A6',
  'Health': '#22C55E',
  'Education': '#66a4ac',
  'Culture': '#FB923C',
};

export const MOCK_ITEMS: MemoryItem[] = [
  {
    id: '1',
    type: 'link',
    title: 'The Anatomy of a Perfect Morning Routine',
    content: 'Research shows that the first 90 minutes of your day set the cognitive tone for the rest of it. High performers from Elon Musk to Barack Obama use structured morning protocols...',
    url: 'https://hubermanlab.com/morning-routine',
    sourceDomain: 'hubermanlab.com',
    thumbnailUrl: '/thumbnails/morning.jpg',
    summary: 'A science-backed breakdown of morning routines used by top performers, covering sleep cycles, light exposure, and deliberate cold exposure.',
    tags: ['Health', 'Productivity', 'Science'],
    isFavorite: true,
    createdAt: '2026-04-15T09:00:00Z',
    relatedIds: ['3', '7'],
    aiProcessed: true,
  },
  {
    id: '2',
    type: 'note',
    title: 'Why LLMs struggle with reasoning',
    content: 'Current transformer architectures optimize for next-token prediction, not abstract reasoning. This fundamental mismatch creates an illusion of understanding. Key insight: statistical correlation ≠ causal understanding. The solution might be neuro-symbolic hybrids.',
    summary: 'A distilled note on the reasoning limitations of large language models and potential architectural solutions.',
    tags: ['AI', 'Research', 'Technology'],
    isFavorite: false,
    createdAt: '2026-04-16T14:30:00Z',
    relatedIds: ['5', '8'],
    aiProcessed: true,
  },
  {
    id: '3',
    type: 'link',
    title: 'The Future of Work: Async-First Organizations',
    content: 'GitLab, a fully remote company of 2000+ employees, operates with zero required meetings. Their handbook has 2000+ pages of documented processes...',
    url: 'https://gitlab.com/handbook',
    sourceDomain: 'gitlab.com',
    thumbnailUrl: '/thumbnails/async.jpg',
    summary: 'How async-first organizations like GitLab are rewriting the rules of knowledge work and what the future of collaboration looks like.',
    tags: ['Business', 'Productivity', 'Culture'],
    isFavorite: false,
    createdAt: '2026-04-14T11:15:00Z',
    relatedIds: ['1', '6'],
    aiProcessed: true,
  },
  {
    id: '4',
    type: 'tweet',
    title: 'Sam Altman on AGI Timeline',
    content: '"We may be approaching AGI sooner than most people think. Not because the models are already AGI, but because the pace of capability improvements is accelerating. The next 2-3 years will be defining."',
    url: 'https://twitter.com/sama/status/123456',
    sourceDomain: 'twitter.com',
    summary: 'Sam Altman\'s candid take on AGI timelines, suggesting the next few years will be significantly more transformative than most anticipate.',
    tags: ['AI', 'Technology'],
    isFavorite: true,
    createdAt: '2026-04-16T08:45:00Z',
    relatedIds: ['2', '5'],
    aiProcessed: true,
  },
  {
    id: '5',
    type: 'link',
    title: 'Attention Is All You Need — Original Transformer Paper',
    content: 'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely...',
    url: 'https://arxiv.org/abs/1706.03762',
    sourceDomain: 'arxiv.org',
    thumbnailUrl: '/thumbnails/transformer.jpg',
    summary: 'The 2017 Google paper that introduced Transformer architecture, which became the foundation of every modern LLM including GPT-4, Claude, and Gemini.',
    tags: ['AI', 'Research', 'Science'],
    isFavorite: false,
    createdAt: '2026-04-12T16:00:00Z',
    relatedIds: ['2', '4'],
    aiProcessed: true,
  },
  {
    id: '6',
    type: 'link',
    title: '10 UX Laws Every Designer Must Know',
    content: "Hick's Law, Fitts's Law, Miller's Law, Jakob's Law... these cognitive principles govern how humans perceive and interact with interfaces. Mastering them is the difference between a good and great designer.",
    url: 'https://lawsofux.com',
    sourceDomain: 'lawsofux.com',
    thumbnailUrl: '/thumbnails/ux.jpg',
    summary: 'A visual guide to the 10 most important UX laws rooted in psychology, with practical examples of each applied in real products.',
    tags: ['Design', 'Psychology', 'Education'],
    isFavorite: true,
    createdAt: '2026-04-13T10:20:00Z',
    relatedIds: ['3', '9'],
    aiProcessed: true,
  },
  {
    id: '7',
    type: 'note',
    title: 'Startup idea: AI-powered meal prep planner',
    content: 'Problem: People waste 40 min/day deciding what to eat. Solution: An AI that learns your taste preferences, nutritional goals, budget, and generates a weekly meal plan with auto-generated grocery list. Monetize through affiliate grocery partnerships. TAM: $50B health + food tech market.',
    summary: 'A startup concept for an AI meal planning assistant with a clear monetization strategy via grocery affiliate partnerships.',
    tags: ['Business', 'AI', 'Health'],
    isFavorite: false,
    createdAt: '2026-04-17T20:00:00Z',
    relatedIds: ['1', '10'],
    aiProcessed: true,
  },
  {
    id: '8',
    type: 'pdf',
    title: 'Deep Work: Rules for Focused Success — Summary',
    content: 'Cal Newport argues that the ability to focus without distraction on cognitively demanding tasks is becoming increasingly rare and increasingly valuable. Key rules: work deeply, embrace boredom, quit social media, drain the shallows.',
    sourceDomain: 'caldewport.com',
    summary: 'A distilled summary of Cal Newport\'s "Deep Work" — covering the 4 rules for achieving focused success in a distracted world.',
    tags: ['Productivity', 'Psychology', 'Education'],
    isFavorite: false,
    createdAt: '2026-04-11T09:30:00Z',
    relatedIds: ['2', '3'],
    aiProcessed: true,
  },
  {
    id: '9',
    type: 'link',
    title: 'Linear — The Issue Tracker Built for Speed',
    content: 'Linear reimagined project management for engineering teams. With 50ms response times, keyboard-first navigation, and Git integration, it\'s become the default tool for high-performance startups...',
    url: 'https://linear.app',
    sourceDomain: 'linear.app',
    thumbnailUrl: '/thumbnails/linear.jpg',
    summary: 'An analysis of why Linear has become the preferred project management tool for engineering-led startups, focused on speed and developer experience.',
    tags: ['Design', 'Productivity', 'Technology'],
    isFavorite: false,
    createdAt: '2026-04-10T13:00:00Z',
    relatedIds: ['6', '3'],
    aiProcessed: true,
  },
  {
    id: '10',
    type: 'video',
    title: 'Richard Feynman: The Pleasure of Finding Things Out',
    content: 'Nobel laureate physicist Richard Feynman discusses the joy of discovery, the nature of scientific thinking, and how curiosity is the most important human trait. "I was born not knowing and have had only a little time to change that here and there."',
    url: 'https://youtube.com/watch?v=nYg6jzotiAc',
    sourceDomain: 'youtube.com',
    thumbnailUrl: '/thumbnails/feynman.jpg',
    summary: 'A timeless 1981 BBC interview with Richard Feynman on curiosity, the scientific method, and the philosophy of knowledge.',
    tags: ['Science', 'Philosophy', 'Education'],
    isFavorite: true,
    createdAt: '2026-04-09T19:00:00Z',
    relatedIds: ['5', '8'],
    aiProcessed: true,
  },
  {
    id: '11',
    type: 'note',
    title: 'Mental model: Second-order thinking',
    content: 'First-order thinking: What happens next? Second-order thinking: What happens after that? And after that? Most people stop at first-order. Champions of strategy (Buffett, Munger, great generals) think in chains of consequence. Apply this to every major decision.',
    summary: 'A note on second-order thinking as a mental model — thinking in chains of consequences rather than immediate effects.',
    tags: ['Philosophy', 'Psychology', 'Business'],
    isFavorite: false,
    createdAt: '2026-04-08T12:00:00Z',
    relatedIds: ['8', '10'],
    aiProcessed: true,
  },
  {
    id: '12',
    type: 'link',
    title: 'How Stripe Built a $95B Payments Company',
    content: 'Stripe\'s rise from a Y Combinator startup to a $95 billion payments giant is a masterclass in developer-first product strategy. They bet on making the complex simple, targeting builders before buyers...',
    url: 'https://stratechery.com/stripe',
    sourceDomain: 'stratechery.com',
    thumbnailUrl: '/thumbnails/stripe.jpg',
    summary: 'A deep-dive into Stripe\'s growth strategy — focusing on developer experience, API design, and how they disrupted the legacy payments industry.',
    tags: ['Business', 'Technology', 'Finance'],
    isFavorite: false,
    createdAt: '2026-04-07T11:00:00Z',
    relatedIds: ['3', '9'],
    aiProcessed: true,
  },
];

export const MOCK_COLLECTIONS: Collection[] = [
  {
    id: 'c1',
    name: 'AI & Machine Learning',
    description: 'Everything about artificial intelligence, LLMs, and machine learning',
    isSmart: true,
    itemCount: 4,
    color: '#06565b',
    emoji: '🤖',
  },
  {
    id: 'c2',
    name: 'Startup Playbook',
    description: 'Resources for building and growing companies',
    isSmart: true,
    itemCount: 3,
    color: '#F59E0B',
    emoji: '🚀',
  },
  {
    id: 'c3',
    name: 'Deep Work',
    description: 'Productivity, focus, and cognitive performance',
    isSmart: true,
    itemCount: 3,
    color: '#003a44',
    emoji: '🧠',
  },
  {
    id: 'c4',
    name: 'Design Inspiration',
    description: 'UI/UX patterns, design systems, and visual inspiration',
    isSmart: false,
    itemCount: 2,
    color: '#66a4ac',
    emoji: '✨',
  },
  {
    id: 'c5',
    name: 'Philosophy & Mental Models',
    description: 'Ways of thinking and reasoning frameworks',
    isSmart: true,
    itemCount: 2,
    color: '#8B5CF6',
    emoji: '💭',
  },
  {
    id: 'c6',
    name: 'Science & Discovery',
    description: 'Papers, talks, and ideas from the scientific world',
    isSmart: false,
    itemCount: 2,
    color: '#10B981',
    emoji: '🔬',
  },
];

export const MOCK_INSIGHTS = [
  {
    id: 'i1',
    type: 'connection',
    title: 'Pattern: Deep Focus & Morning Routines are linked',
    description: 'Your saved items on Deep Work, morning routines, and cognitive performance all point to the same underlying principle: protecting uninterrupted time blocks.',
    itemIds: ['1', '8', '3'],
    confidence: 0.92,
  },
  {
    id: 'i2',
    type: 'cluster',
    title: 'Emerging theme: AI reasoning limitations',
    description: 'Multiple items this week touch on why current AI systems fail at true reasoning. This could be worth exploring further.',
    itemIds: ['2', '4', '5'],
    confidence: 0.87,
  },
  {
    id: 'i3',
    type: 'suggestion',
    title: 'You haven\'t revisited your startup ideas in 7 days',
    description: '3 saved items could inform your startup concept. Want a quick synthesis?',
    itemIds: ['7', '12', '3'],
    confidence: 0.78,
  },
];
