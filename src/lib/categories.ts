/**
 * Enhanced Category Taxonomy & Smart Collections
 *
 * Shared between client (CaptureModal, MemoryCard, Sidebar) and server (db-collections, ai-engine).
 * This file must NOT have 'use server' — it must be importable by both sides.
 */

export interface CategoryDefinition {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  matchTags: string[];
  keywords: string[];
}

export interface CategoryCollectionDef {
  id?: string;
  name: string;
  emoji: string;
  color: string;
  /** Tags that cause an item to be added to this collection automatically */
  matchTags: string[];
}

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    emoji: '🤖',
    color: '#8B5CF6',
    description: 'Generative models, LLMs, AI agents, reasoning, and neural networks',
    matchTags: [
      'Generative AI',
      'LLMs & Reasoning',
      'AI Agents',
      'Prompt Engineering',
      'Machine Learning',
      'AI & ML',
      'Deep Learning',
      'Neural Network',
      'Artificial Intelligence',
      'ChatGPT',
      'Claude',
      'Gemini',
      'OpenAI',
      'Anthropic',
      'AI Research',
    ],
    keywords: [
      'ai', 'llm', 'gpt', 'claude', 'gemini', 'deepseek', 'model', 'agent', 'prompt',
      'neural', 'transformer', 'fine-tuning', 'vector', 'rag', 'genai', 'machine learning'
    ],
  },
  {
    id: 'web-dev',
    name: 'Web Development',
    emoji: '🌐',
    color: '#06B6D4',
    description: 'Frontend frameworks, responsive interfaces, APIs, and modern web tools',
    matchTags: [
      'Web Development',
      'Next.js',
      'React',
      'Vue.js',
      'Node.js',
      'TypeScript',
      'JavaScript',
      'Tailwind CSS',
      'HTML',
      'CSS',
      'Frontend',
      'Fullstack',
    ],
    keywords: [
      'web', 'next.js', 'react', 'vue', 'tailwind', 'frontend', 'css', 'javascript',
      'typescript', 'fullstack', 'dom', 'browser', 'html'
    ],
  },
  {
    id: 'coding-eng',
    name: 'Software & Engineering',
    emoji: '💻',
    color: '#3B82F6',
    description: 'Backend systems, programming languages, databases, cloud, and DevOps',
    matchTags: [
      'Coding',
      'Python',
      'Rust',
      'Go (Golang)',
      'Databases & SQL',
      'PostgreSQL',
      'Software Architecture',
      'Cloud & DevOps',
      'Open Source',
      'Cybersecurity',
      'Backend',
      'Programming',
    ],
    keywords: [
      'code', 'python', 'rust', 'golang', 'sql', 'database', 'postgres', 'docker',
      'kubernetes', 'backend', 'architecture', 'devops', 'api', 'server', 'git'
    ],
  },
  {
    id: 'design-ui',
    name: 'UI/UX & Design',
    emoji: '🎨',
    color: '#EC4899',
    description: 'User experience, design systems, Figma, typography, and visual aesthetics',
    matchTags: [
      'UI/UX Design',
      'Design Systems',
      'Figma',
      'Typography',
      'Accessibility & a11y',
      'Design & Visuals',
      'Design',
      'User Experience',
      'User Interface',
      'Wireframe',
      'Graphic Design',
      'Visual Design',
    ],
    keywords: [
      'design', 'ui', 'ux', 'figma', 'font', 'typography', 'prototype', 'mockup',
      'wireframe', 'interface', 'palette', 'component', 'aesthetic'
    ],
  },
  {
    id: 'startups-business',
    name: 'Startups & Business',
    emoji: '🚀',
    color: '#F59E0B',
    description: 'SaaS, bootstrapping, indie hacking, marketing, and venture growth',
    matchTags: [
      'SaaS & Startups',
      'Indie Hacking',
      'Venture Capital',
      'Marketing & SEO',
      'Product Management',
      'Business Strategy',
      'Entrepreneurship',
      'Build In Public',
      'Business',
    ],
    keywords: [
      'startup', 'saas', 'founder', 'venture', 'mrr', 'arr', 'marketing', 'seo',
      'product', 'growth', 'business', 'pricing', 'revenue', 'launch'
    ],
  },
  {
    id: 'finance-crypto',
    name: 'Finance & Crypto',
    emoji: '💰',
    color: '#10B981',
    description: 'Investing, stock markets, personal finance, web3, and macro economics',
    matchTags: [
      'Investing & Stocks',
      'Personal Finance',
      'Crypto & Web3',
      'Real Estate',
      'Finance & Economics',
      'Bitcoin',
      'Ethereum',
      'Finance',
    ],
    keywords: [
      'investing', 'stocks', 'etf', 'crypto', 'bitcoin', 'ethereum', 'finance',
      'wealth', 'budget', 'economics', 'market', 'portfolio', 'dividend'
    ],
  },
  {
    id: 'productivity-pkm',
    name: 'Productivity & PKM',
    emoji: '⚡',
    color: '#6366F1',
    description: 'Second brain, personal knowledge management, note-taking, and deep work',
    matchTags: [
      'Second Brain & PKM',
      'Productivity & Habits',
      'Workflow Automation',
      'Productivity',
      'Note-taking',
      'Deep Work',
      'Obsidian',
      'Notion',
    ],
    keywords: [
      'second brain', 'pkm', 'productivity', 'habits', 'focus', 'workflow',
      'automation', 'obsidian', 'notion', 'notes', 'time management', 'gtd'
    ],
  },
  {
    id: 'science-research',
    name: 'Science & Research',
    emoji: '🔬',
    color: '#14B8A6',
    description: 'Scientific research papers, physics, space, neuroscience, and philosophy',
    matchTags: [
      'Science & Research',
      'Space & Physics',
      'Philosophy & Mindset',
      'Academic',
      'Biology',
      'Neuroscience',
    ],
    keywords: [
      'science', 'research', 'arxiv', 'physics', 'space', 'biology', 'philosophy',
      'mental model', 'scientific', 'quantum', 'experiment', 'paper'
    ],
  },
  {
    id: 'health-wellness',
    name: 'Health & Wellness',
    emoji: '🌿',
    color: '#22C55E',
    description: 'Fitness, sleep optimization, longevity, biohacking, and nutrition',
    matchTags: [
      'Fitness & Workouts',
      'Sleep & Recovery',
      'Biohacking & Longevity',
      'Nutrition & Diet',
      'Mental Health & Mindfulness',
      'Health & Wellness',
      'Health',
    ],
    keywords: [
      'fitness', 'workout', 'gym', 'sleep', 'longevity', 'nutrition', 'diet',
      'health', 'wellness', 'meditation', 'mental health', 'biohacking'
    ],
  },
  {
    id: 'media-reads',
    name: 'Media & Reads',
    emoji: '🎬',
    color: '#E11D48',
    description: 'Podcasts, video lectures, books, essays, cinema, and social discourse',
    matchTags: [
      'Podcasts',
      'Books & Reading',
      'Writing & Publishing',
      'Cinema & TV',
      'Music & Audio',
      'Gaming & Esports',
      'Video',
      'Social Media',
    ],
    keywords: [
      'podcast', 'book', 'reading', 'video', 'youtube', 'movie', 'cinema',
      'music', 'writing', 'essay', 'gaming', 'entertainment'
    ],
  },
  {
    id: 'travel-places',
    name: 'Travel & Places',
    emoji: '✈️',
    color: '#0EA5E9',
    description: 'City guides, destinations, trips, itineraries, tours, and travel notes',
    matchTags: [
      'Travel',
      'Destination',
      'Tourism',
      'City Guide',
      'Trip',
      'Vacation',
      'Hospitality',
    ],
    keywords: [
      'travel', 'trip', 'destination', 'tour', 'vacation', 'flight', 'hotel',
      'wanderlust', 'itinerary', 'tourism', 'city guide'
    ],
  },
];

/**
 * Backward-compatible list of category collections.
 */
export const DEFAULT_CATEGORY_COLLECTIONS: CategoryCollectionDef[] = CATEGORY_DEFINITIONS.map(def => ({
  id: def.id,
  name: def.name,
  emoji: def.emoji,
  color: def.color,
  matchTags: def.matchTags,
}));

/**
 * Computes the primary category for an item based on its tags, title, content, and URL.
 */
export function getPrimaryCategory(
  tags: string[] = [],
  contentOrTitle: string = '',
  url: string = ''
): { id: string; name: string; emoji: string; color: string } {
  const cleanTags = (tags || []).map(t => t.trim().toLowerCase());
  const searchText = `${contentOrTitle} ${url}`.toLowerCase();

  let bestDef: CategoryDefinition | null = null;
  let highestScore = 0;

  for (const def of CATEGORY_DEFINITIONS) {
    let score = 0;

    // 1. Tag matches (high signal: 10 points per tag match)
    for (const matchTag of def.matchTags) {
      if (cleanTags.includes(matchTag.toLowerCase())) {
        score += 10;
      }
    }

    // 2. Keyword matches in title/url/content (moderate signal: 2 points per keyword)
    for (const kw of def.keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(searchText)) {
        score += 2;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestDef = def;
    }
  }

  if (bestDef && highestScore > 0) {
    return {
      id: bestDef.id,
      name: bestDef.name,
      emoji: bestDef.emoji,
      color: bestDef.color,
    };
  }

  // Graceful fallback for uncategorized resources
  return {
    id: 'general',
    name: 'Knowledge',
    emoji: '💡',
    color: '#64748B',
  };
}

/**
 * Returns all matching category definitions for an item.
 */
export function matchCategoriesForItem(
  tags: string[] = [],
  contentOrTitle: string = '',
  url: string = ''
): CategoryDefinition[] {
  const cleanTags = (tags || []).map(t => t.trim().toLowerCase());
  const searchText = `${contentOrTitle} ${url}`.toLowerCase();

  return CATEGORY_DEFINITIONS.filter(def => {
    // Has tag match
    const tagMatch = def.matchTags.some(t => cleanTags.includes(t.toLowerCase()));
    if (tagMatch) return true;

    // Or multiple keyword matches
    const kwCount = def.keywords.filter(kw => new RegExp(`\\b${kw}\\b`, 'i').test(searchText)).length;
    return kwCount >= 2;
  });
}

/**
 * Checks if an item matches a category by ID or Name.
 */
export function isItemInCategory(
  item: { tags?: string[]; title?: string; content?: string; url?: string },
  categoryIdOrName: string
): boolean {
  if (!categoryIdOrName) return false;
  const target = categoryIdOrName.trim().toLowerCase();

  const def = CATEGORY_DEFINITIONS.find(
    d => d.id.toLowerCase() === target || d.name.toLowerCase() === target
  );

  if (!def) return false;

  const itemTags = (item.tags || []).map(t => t.trim().toLowerCase());
  if (def.matchTags.some(mt => itemTags.includes(mt.toLowerCase()))) {
    return true;
  }

  const searchText = `${item.title || ''} ${item.content || ''} ${item.url || ''}`.toLowerCase();
  const kwMatches = def.keywords.filter(kw => new RegExp(`\\b${kw}\\b`, 'i').test(searchText));
  return kwMatches.length >= 2;
}
