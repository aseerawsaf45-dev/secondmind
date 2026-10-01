/**
 * Intelligent AI Categorization and Summarization Engine
 * Dynamically classifies content into rich, diverse, and accurate categories.
 */

export interface AIAnalysisResult {
  title?: string;
  summary: string;
  tags: string[];
}

export interface ClassifyOptions {
  title?: string;
  url?: string;
  metaKeywords?: string[];
  maxTags?: number;
  contentType?: string;
}

interface TagRule {
  tag: string;
  category: string;
  patterns: RegExp[];
  negativePatterns?: RegExp[];
  weight?: number;
}

// ── Rich, Curated Taxonomy with High-Accuracy Patterns ─────────────────────────
const TAXONOMY: TagRule[] = [
  // --- AI & MACHINE LEARNING ---
  {
    tag: 'Generative AI',
    category: 'ai',
    patterns: [
      /\b(generative ai|genai|midjourney|stable diffusion|dall-?e|sora|flux|runway|comfyui|text-to-image|image-to-video|text-to-video)\b/i,
    ],
    weight: 1.4,
  },
  {
    tag: 'LLMs & Reasoning',
    category: 'ai',
    patterns: [
      /\b(llm|llms|large language model|chatgpt|gpt-?4|gpt-?o|claude|anthropic|gemini|deepseek|llama|mistral|reasoning model|hybrid reasoning|prompt caching|chain-of-thought|context window)\b/i,
    ],
    weight: 1.4,
  },
  {
    tag: 'AI Agents',
    category: 'ai',
    patterns: [
      /\b(ai agent|ai agents|agentic|autonomous agent|autogpt|crewai|langchain|langgraph|function calling|tool use|mcp|model context protocol|multi-agent)\b/i,
    ],
    weight: 1.35,
  },
  {
    tag: 'Prompt Engineering',
    category: 'ai',
    patterns: [
      /\b(prompt engineering|system prompt|few-shot|zero-shot|in-context learning|prompt optimization|prompting technique)\b/i,
    ],
    weight: 1.3,
  },
  {
    tag: 'Machine Learning',
    category: 'ai',
    patterns: [
      /\b(machine learning|deep learning|neural network|neural net|nlp|computer vision|transformer|fine-tuning|lora|embeddings|vector db|rag|retrieval augmented)\b/i,
    ],
    weight: 1.25,
  },
  {
    tag: 'AI & ML',
    category: 'ai',
    patterns: [
      /\b(artificial intelligence|ai research|openai|anthropic|deepmind|ai tool|ai model|artificial general intelligence|agi)\b/i,
    ],
    weight: 1.0,
  },

  // --- PROGRAMMING LANGUAGES & FRAMEWORKS ---
  {
    tag: 'Next.js',
    category: 'framework',
    patterns: [/\b(next\.?js|nextjs|turbopack|app router|server actions|server components|getserversideprops)\b/i],
    weight: 1.5,
  },
  {
    tag: 'React',
    category: 'framework',
    patterns: [/\b(react|react\.?js|reactjs|jsx|tsx|useeffect|usestate|usememo|react native)\b/i],
    negativePatterns: [/\breaction\b/i],
    weight: 1.4,
  },
  {
    tag: 'TypeScript',
    category: 'language',
    patterns: [/\b(typescript|ts-node|tsconfig|generics|typecheck)\b/i],
    weight: 1.4,
  },
  {
    tag: 'JavaScript',
    category: 'language',
    patterns: [/\b(javascript|ecmascript|vanilla js)\b/i, /(?<![\.\w/])js(?![\.\w/])/i],
    negativePatterns: [/\bnext\.?js\b/i, /\bnode\.?js\b/i, /\bvue\.?js\b/i, /\bnuxt\.?js\b/i],
    weight: 1.1,
  },
  {
    tag: 'Python',
    category: 'language',
    patterns: [/\b(python|python3|pip|pytorch|pandas|numpy|fastapi|django|flask|scikit-learn)\b/i],
    weight: 1.35,
  },
  {
    tag: 'Rust',
    category: 'language',
    patterns: [/\b(rust|cargo|rustlang|borrow checker)\b/i],
    negativePatterns: [/\brustic\b/i, /\brusty\b/i],
    weight: 1.4,
  },
  {
    tag: 'Go (Golang)',
    category: 'language',
    patterns: [/\b(golang|goroutines|go lang)\b/i],
    weight: 1.4,
  },
  {
    tag: 'Tailwind CSS',
    category: 'styling',
    patterns: [/\b(tailwind|tailwindcss|utility-first css)\b/i],
    weight: 1.3,
  },
  {
    tag: 'Node.js',
    category: 'runtime',
    patterns: [/\b(node\.?js|nodejs|npm|pnpm|bun\.sh|express\.js|deno)\b/i],
    weight: 1.3,
  },
  {
    tag: 'Vue.js',
    category: 'framework',
    patterns: [/\b(vue\.?js|vuejs|nuxt|pinia|vuex)\b/i],
    weight: 1.35,
  },
  {
    tag: 'PostgreSQL',
    category: 'database',
    patterns: [/\b(postgres|postgresql|psql|neon\.tech|supabase|pgvector)\b/i],
    weight: 1.4,
  },
  {
    tag: 'Databases & SQL',
    category: 'database',
    patterns: [/\b(database|databases|sql|nosql|mongodb|redis|prisma|drizzle|orm|sqlite|mysql|dynamodb|clickhouse)\b/i],
    weight: 1.2,
  },
  {
    tag: 'Cloud & DevOps',
    category: 'cloud',
    patterns: [/\b(cloud|aws|azure|gcp|docker|kubernetes|k8s|serverless|devops|terraform|ci\/cd|vercel|cloudflare|ansible)\b/i],
    weight: 1.3,
  },
  {
    tag: 'Web Development',
    category: 'web',
    patterns: [/\b(web dev|web development|frontend|backend|fullstack|css|html|browser|dom|api|graphql|rest api|websockets)\b/i],
    weight: 1.1,
  },
  {
    tag: 'Software Architecture',
    category: 'architecture',
    patterns: [/\b(software architecture|system design|microservices|distributed systems|scalability|clean code|design patterns|event-driven|caching)\b/i],
    weight: 1.3,
  },
  {
    tag: 'Cybersecurity',
    category: 'security',
    patterns: [/\b(cybersecurity|infosec|vulnerability|zero-day|auth|penetration testing|malware|encryption|ssl|tls|oauth|firewall)\b/i],
    weight: 1.3,
  },
  {
    tag: 'Open Source',
    category: 'opensource',
    patterns: [/\b(open source|oss|github|gitlab|git repo|pull request|mit license|contributor|fork)\b/i],
    weight: 1.25,
  },

  // --- DESIGN & CREATIVE ---
  {
    tag: 'UI/UX Design',
    category: 'design',
    patterns: [/\b(ui\/ux|ux design|ui design|user experience|user interface|wireframe|mockup|prototype|usability|heuristic|interaction design)\b/i],
    weight: 1.4,
  },
  {
    tag: 'Design Systems',
    category: 'design',
    patterns: [/\b(design system|design systems|component library|design tokens|figma components|shadcn|radix|accessible components)\b/i],
    weight: 1.4,
  },
  {
    tag: 'Typography',
    category: 'design',
    patterns: [/\b(typography|typeface|font|fonts|kerning|serif|sans-serif|font pairing|editorial design)\b/i],
    weight: 1.3,
  },
  {
    tag: 'Figma',
    category: 'design',
    patterns: [/\b(figma|figjam|auto-layout|figma plugin)\b/i],
    weight: 1.4,
  },
  {
    tag: 'Accessibility & a11y',
    category: 'design',
    patterns: [/\b(accessibility|a11y|wcag|screen reader|aria|accessible design)\b/i],
    weight: 1.3,
  },
  {
    tag: 'Design & Visuals',
    category: 'design',
    patterns: [/\b(graphic design|visual design|branding|color palette|layout|art direction|svg|illustration)\b/i],
    weight: 1.0,
  },

  // --- BUSINESS, STARTUPS & CAREER ---
  {
    tag: 'SaaS & Startups',
    category: 'business',
    patterns: [/\b(saas|startup|startups|mrr|arr|bootstrapped|bootstrapping|founder|co-founder|pre-seed|seed round|churn rate)\b/i],
    weight: 1.4,
  },
  {
    tag: 'Indie Hacking',
    category: 'business',
    patterns: [/\b(indie hacker|indie hacking|solopreneur|solo founder|solo founders|build in public|microsaas|side project)\b/i],
    weight: 1.4,
  },
  {
    tag: 'Venture Capital',
    category: 'business',
    patterns: [/\b(venture capital|vc funding|angel investor|term sheet|valuation|y combinator|series a|series b)\b/i],
    weight: 1.3,
  },
  {
    tag: 'Marketing & SEO',
    category: 'business',
    patterns: [/\b(marketing|seo|search engine optimization|copywriting|cold email|newsletter growth|organic traffic|ad campaign|content marketing|conversion rate)\b/i],
    weight: 1.3,
  },
  {
    tag: 'Product Management',
    category: 'business',
    patterns: [/\b(product management|product manager|product-led|pmf|product market fit|roadmap|feature launch|user feedback)\b/i],
    weight: 1.3,
  },
  {
    tag: 'Business Strategy',
    category: 'business',
    patterns: [/\b(business|leadership|management|executive|strategy|pricing|sales|revenue|b2b|entrepreneur|b2c|ecommerce)\b/i],
    weight: 1.0,
  },

  // --- FINANCE & INVESTING ---
  {
    tag: 'Investing & Stocks',
    category: 'finance',
    patterns: [/\b(investing|stocks|stock market|index fund|index funds|etf|etfs|dividends?|dividend yields?|asset allocation|portfolio|s&p 500|equities|valuation)\b/i],
    weight: 1.4,
  },
  {
    tag: 'Personal Finance',
    category: 'finance',
    patterns: [/\b(personal finance|budgeting|savings|retirement|401k|roth ira|wealth building|compound interest|emergency fund|frugal|asset allocation|wealth|passive income|net worth|portfolio allocation)\b/i],
    weight: 1.3,
  },
  {
    tag: 'Crypto & Web3',
    category: 'finance',
    patterns: [/\b(crypto|cryptocurrency|bitcoin|btc|ethereum|eth|solana|blockchain|web3|defi|nft|smart contracts)\b/i],
    weight: 1.4,
  },
  {
    tag: 'Real Estate',
    category: 'finance',
    patterns: [/\b(real estate|property investment|mortgage|rental property|reit|housing market)\b/i],
    weight: 1.3,
  },
  {
    tag: 'Finance & Economics',
    category: 'finance',
    patterns: [/\b(finance|economy|economic|inflation|interest rates|federal reserve|gdp|monetary policy)\b/i],
    weight: 1.0,
  },

  // --- PRODUCTIVITY & KNOWLEDGE ---
  {
    tag: 'Second Brain & PKM',
    category: 'productivity',
    patterns: [/\b(second brain|pkm|personal knowledge management|obsidian|notion|roam|logseq|zettelkasten|note-taking|knowledge base|knowledge graph)\b/i],
    weight: 1.5,
  },
  {
    tag: 'Productivity & Habits',
    category: 'productivity',
    patterns: [/\b(productivity|habits|habit building|time management|deep work|focus|flow state|gtd|getting things done|time blocking|pomodoro)\b/i],
    weight: 1.25,
  },
  {
    tag: 'Workflow Automation',
    category: 'productivity',
    patterns: [/\b(workflow|automation|zapier|make\.com|n8n|shortcuts|alfred|raycast|streamline)\b/i],
    weight: 1.3,
  },

  // --- HEALTH, FITNESS & WELLNESS ---
  {
    tag: 'Fitness & Workouts',
    category: 'health',
    patterns: [/\b(fitness|workout|gym|strength training|hypertrophy|weightlifting|cardio|zone 2|running|marathon|crossfit|hiit|endurance)\b/i],
    weight: 1.4,
  },
  {
    tag: 'Sleep & Recovery',
    category: 'recovery',
    patterns: [/\b(sleep|circadian rhythm|deep sleep|rem sleep|sleep quality|sauna|cold plunge|recovery|melatonin|insomnia|whoop|oura)\b/i],
    weight: 1.4,
  },
  {
    tag: 'Biohacking & Longevity',
    category: 'longevity',
    patterns: [/\b(biohack|biohacking|circadian|sauna|cold plunge|zone 2|longevity|healthspan|intermittent fasting|cold shower|hyperbaric)\b/i],
    weight: 1.35,
  },
  {
    tag: 'Nutrition & Diet',
    category: 'health',
    patterns: [/\b(nutrition|diet|protein|macros|keto|fasting|intermittent fasting|micronutrients|supplements|gut health|metabolism)\b/i],
    weight: 1.3,
  },
  {
    tag: 'Mental Health & Mindfulness',
    category: 'health',
    patterns: [/\b(mental health|meditation|mindfulness|anxiety|stress relief|therapy|counseling|psychology|wellbeing|dopamine detox)\b/i],
    weight: 1.3,
  },
  {
    tag: 'Health & Wellness',
    category: 'health',
    patterns: [/\b(health|wellness|longevity|biohacking|medical|doctor|immune system|healthspan)\b/i],
    weight: 1.0,
  },

  // --- FOOD & CULINARY ---
  {
    tag: 'Cooking & Recipes',
    category: 'lifestyle',
    patterns: [/\b(cooking|recipe|recipes|chef|meal prep|dinner|culinary|dish|pan-sear|roast|sauce|ingredients|flavor)\b/i],
    weight: 1.4,
  },
  {
    tag: 'Baking & Dough',
    category: 'lifestyle',
    patterns: [/\b(baking|sourdough|dough|fermentation|bread|pizza|pastry|flour|yeast|crust|hydration|knead)\b/i],
    weight: 1.4,
  },
  {
    tag: 'Coffee & Drinks',
    category: 'lifestyle',
    patterns: [/\b(coffee|espresso|pour over|barista|latte|roast|brew|cocktail|wine|tea|matcha|aeropress)\b/i],
    weight: 1.3,
  },
  {
    tag: 'Food & Dining',
    category: 'lifestyle',
    patterns: [/\b(food|restaurant|street food|gastronomy|cuisine|delicious|tasting menu)\b/i],
    weight: 1.0,
  },

  // --- SCIENCE, PHILOSOPHY & EDUCATION ---
  {
    tag: 'Philosophy & Mindset',
    category: 'science',
    patterns: [/\b(philosophy|stoic|stoicism|marcus aurelius|ethics|mental models|epistemology|critical thinking|rationality)\b/i],
    weight: 1.3,
  },
  {
    tag: 'Space & Physics',
    category: 'science',
    patterns: [/\b(space|astronomy|nasa|spacex|astrophysics|quantum|physics|relativity|cosmos|galaxy|telescope)\b/i],
    weight: 1.3,
  },
  {
    tag: 'Science & Research',
    category: 'science',
    patterns: [/\b(science|scientific research|arxiv|peer-reviewed|laboratory|biology|genetics|neuroscience|chemistry)\b/i],
    weight: 1.2,
  },
  {
    tag: 'Writing & Publishing',
    category: 'media',
    patterns: [/\b(writing|essay|memoir|storytelling|copywriting|author|publishing|novel|prose|draft|creative writing)\b/i],
    weight: 1.25,
  },
  {
    tag: 'Books & Reading',
    category: 'media',
    patterns: [/\b(book summary|books to read|goodreads|reading list|literature|non-fiction|fiction book|book review)\b/i],
    weight: 1.3,
  },

  // --- MEDIA, GAMING & SOCIAL ---
  {
    tag: 'Gaming & Esports',
    category: 'media',
    patterns: [/\b(gaming|esports|game dev|unreal engine|unity|steam|playstation|xbox|nintendo|gameplay|rpg|fps|indie game)\b/i],
    weight: 1.3,
  },
  {
    tag: 'Podcasts',
    category: 'media',
    patterns: [/\b(podcast|podcasts|episode|audiobook|interviews? show|spotify podcast)\b/i],
    weight: 1.3,
  },
  {
    tag: 'Cinema & TV',
    category: 'media',
    patterns: [/\b(cinema|movie|film|director|hollywood|netflix|tv series|cinematography|screenplay)\b/i],
    weight: 1.2,
  },
  {
    tag: 'Music & Audio',
    category: 'media',
    patterns: [/\b(music|album|song|soundtrack|musician|spotify|audio production|synth|composition)\b/i],
    weight: 1.2,
  },
  {
    tag: 'Social Media',
    category: 'media',
    patterns: [/\b(social media|twitter|x\.com|facebook|instagram|tiktok|linkedin|threads|creator economy)\b/i],
    weight: 1.1,
  },

  // --- CONTENT FORMAT & INTENT ---
  {
    tag: 'Guide & Tutorial',
    category: 'format',
    patterns: [/\b(how-?to|tutorial|step-by-step|guide|walkthrough|beginner's guide|deep dive|handbook)\b/i],
    weight: 1.0,
  },
  {
    tag: 'Case Study',
    category: 'format',
    patterns: [/\b(case study|retrospective|lessons learned|breakdown|postmortem)\b/i],
    weight: 1.2,
  },
];

// Domain mappings for high-precision context
const DOMAIN_TAGS: Record<string, string[]> = {
  'github.com': ['Open Source', 'Web Development'],
  'gitlab.com': ['Open Source', 'Web Development'],
  'arxiv.org': ['Science & Research', 'Academic'],
  'biorxiv.org': ['Science & Research', 'Biology'],
  'figma.com': ['UI/UX Design', 'Design Systems'],
  'dribbble.com': ['UI/UX Design', 'Design & Visuals'],
  'behance.net': ['UI/UX Design', 'Design & Visuals'],
  'stackoverflow.com': ['Web Development', 'Programming'],
  'techcrunch.com': ['SaaS & Startups', 'Tech News'],
  'news.ycombinator.com': ['Tech News', 'Startups'],
  'producthunt.com': ['SaaS & Startups', 'Tools'],
  'substack.com': ['Newsletter', 'Writing & Publishing'],
  'medium.com': ['Article', 'Writing & Publishing'],
  'youtube.com': ['Video'],
  'youtu.be': ['Video'],
  'x.com': ['Social Media', 'X'],
  'twitter.com': ['Social Media', 'Twitter'],
  'linkedin.com': ['Career', 'Professional'],
  'nytimes.com': ['News & Journalism'],
  'bloomberg.com': ['Finance & Economics', 'Business Strategy'],
  'wsj.com': ['Finance & Economics', 'Business Strategy'],
  'theverge.com': ['Tech News'],
  'wired.com': ['Tech News'],
};

interface ScoredTag {
  tag: string;
  category: string;
  score: number;
  isSpecific: boolean;
}

/**
 * Extracts and formats hashtags into human-readable tags
 * e.g. #buildinpublic -> 'Build In Public', #nextjs -> 'Next.js'
 */
function extractHashtags(text: string): { tag: string; score: number }[] {
  const matches = text.match(/#([a-zA-Z0-9_]{2,30})/g);
  if (!matches) return [];

  const tagOverrides: Record<string, string> = {
    nextjs: 'Next.js',
    reactjs: 'React',
    react: 'React',
    indiehacker: 'Indie Hacking',
    indiehackers: 'Indie Hacking',
    buildinpublic: 'Build In Public',
    uiux: 'UI/UX Design',
    ai: 'AI & ML',
    ml: 'Machine Learning',
    webdev: 'Web Development',
    frontend: 'Frontend',
    backend: 'Backend',
    typescript: 'TypeScript',
    python: 'Python',
    saas: 'SaaS & Startups',
    solopreneur: 'Indie Hacking',
    pkm: 'Second Brain & PKM',
  };

  const results: { tag: string; score: number }[] = [];
  const seen = new Set<string>();

  for (const raw of matches) {
    const clean = raw.slice(1);
    const lower = clean.toLowerCase();
    const formatted =
      tagOverrides[lower] ||
      clean
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, (c) => c.toUpperCase());

    if (!seen.has(formatted.toLowerCase())) {
      seen.add(formatted.toLowerCase());
      results.push({ tag: formatted, score: 14 });
    }
  }

  return results;
}

/**
 * Classifies content with weighted scoring, diversity balancing, and domain awareness.
 *
 * @param text - The main content or body text to analyze
 * @param defaultTags - Optional default or preset tags (e.g. ['Video', 'X'])
 * @param options - Optional context including title, url, metaKeywords, maxTags
 */
export function classifyContent(
  text: string,
  defaultTags: string[] = [],
  options: ClassifyOptions = {}
): string[] {
  if (!text && !options.title && !options.url) {
    return defaultTags.length ? defaultTags : ['Saved'];
  }

  const maxTags = options.maxTags || 4;
  const title = (options.title || '').trim();
  const url = (options.url || '').trim();
  const metaKeywords = options.metaKeywords || [];
  const fullText = `${title} ${text}`;

  const scores = new Map<string, ScoredTag>();

  function addScore(tag: string, category: string, points: number, isSpecific = false) {
    const existing = scores.get(tag);
    if (existing) {
      existing.score += points;
      if (isSpecific) existing.isSpecific = true;
    } else {
      scores.set(tag, { tag, category, score: points, isSpecific });
    }
  }

  // 1. Extract hashtags directly from text
  const hashtags = extractHashtags(fullText);
  for (const ht of hashtags) {
    addScore(ht.tag, 'hashtag', ht.score, true);
  }

  // 2. Domain matching
  if (url) {
    try {
      const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(
        /^www\./,
        ''
      );
      if (DOMAIN_TAGS[hostname]) {
        for (const dTag of DOMAIN_TAGS[hostname]) {
          addScore(dTag, 'domain', 8, true);
        }
      }
    } catch {}
  }

  // 3. Score against curated taxonomy
  for (const rule of TAXONOMY) {
    // Check negative disambiguation patterns
    if (rule.negativePatterns) {
      const isNegative = rule.negativePatterns.some((np) => np.test(fullText));
      if (isNegative) continue;
    }

    const weight = rule.weight || 1.0;

    for (const pattern of rule.patterns) {
      // Title match (heavy signal)
      if (title && pattern.test(title)) {
        addScore(rule.tag, rule.category, 10 * weight, true);
      }

      // Meta publisher keywords
      for (const mk of metaKeywords) {
        if (pattern.test(mk)) {
          addScore(rule.tag, rule.category, 8 * weight, true);
        }
      }

      // URL path match (e.g. /tutorials/nextjs-drizzle)
      if (url && pattern.test(url)) {
        addScore(rule.tag, rule.category, 6 * weight, true);
      }

      // Body text occurrences
      const matches = fullText.match(new RegExp(pattern.source, 'gi'));
      if (matches && matches.length > 0) {
        const countBonus = Math.min(matches.length, 3);
        addScore(rule.tag, rule.category, (3.5 + countBonus * 1.5) * weight, rule.category !== 'format');
      }
    }
  }

  // 4. Incorporate caller default tags (e.g. 'Social', 'X', 'Video')
  for (const dt of defaultTags) {
    if (dt && dt !== 'Link' && dt !== 'Saved' && dt !== 'General') {
      addScore(dt, 'user', 8, true);
    }
  }

  // 5. Candidate sorting by relevance score
  const candidates = Array.from(scores.values()).sort((a, b) => b.score - a.score);

  // 6. Diversity & Redundancy Filter:
  // Avoid returning 4 tags from the exact same category when diverse subtopics are present
  const selected: string[] = [];
  const categoryCounts = new Map<string, number>();

  for (const item of candidates) {
    if (selected.length >= maxTags) break;

    // Prune overly broad tags if a specific framework or tool is already chosen
    if (item.tag === 'Web Development' && selected.includes('Next.js') && candidates.length > 2) {
      continue;
    }
    if (item.tag === 'AI & ML' && selected.some((t) => t.includes('LLM') || t.includes('AI Agents')) && selected.length >= 2) {
      continue;
    }
    if (item.tag === 'Design & Visuals' && selected.some((t) => t.includes('UI/UX') || t.includes('Design Systems'))) {
      continue;
    }

    const currentCatCount = categoryCounts.get(item.category) || 0;
    // Cap at 2 tags per broad category to guarantee variety across topic, framework, and format
    if (currentCatCount >= 2 && candidates.length > maxTags) {
      continue;
    }

    selected.push(item.tag);
    categoryCounts.set(item.category, currentCatCount + 1);
  }

  // 2nd pass: If slots remain, fill with next best scored candidates to maximize richness
  if (selected.length < maxTags) {
    for (const item of candidates) {
      if (selected.length >= maxTags) break;
      if (!selected.includes(item.tag)) {
        selected.push(item.tag);
      }
    }
  }

  // Fallback if no specific categories triggered
  if (selected.length === 0) {
    return defaultTags.length ? defaultTags : ['Saved'];
  }

  return selected.slice(0, maxTags);
}

/**
 * Cleans social media metrics (e.g. "20K views · 1K reactions") and engagement clickbait (e.g. "Comment AI and I'll DM you").
 */
export function cleanSocialText(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // 1. Remove social engagement metrics
  cleaned = cleaned.replace(
    /\b\d+(\.\d+)?[KMBkmb]?\s*(?:views|reactions|likes|comments|shares|retweets|reposts|replies|plays)\b(?:\s*[·•|\-—]\s*\b\d+(\.\d+)?[KMBkmb]?\s*(?:views|reactions|likes|comments|shares|retweets|reposts|replies|plays)\b)*/gi,
    ''
  );

  // 2. Remove engagement clickbaits & CTA commands
  const ctaPatterns = [
    /\b(?:🚨)?\s*(?:follow\s*\+\s*)?(?:comment|drop a comment|type|reply|dm me|send me|inbox me)\s+["“'‘][^"”'’]+["”'’]\s*(?:and|to|for|i['’]ll|we['’]ll|to get|to receive)?[^.!?\n]*/gi,
    /\b(?:🚨)?\s*follow\s*\+\s*(?:comment|dm|reply|like)[^.!?\n]*/gi,
    /💬\s*(?:comment|reply|dm)[^.!?\n]*/gi,
    /\b(?:comment|type|drop)\s+["“'‘][^"”'’]+["”'’][^.!?\n]*/gi,
    /\b(?:dm|inbox)\s+me\s+["“'‘]?[a-zA-Z0-9_\s]+["”'’]?\s*(?:to get|for|and|to receive)[^.!?\n]*/gi,
    /\b(?:comment|drop a comment)\s+below[^.!?\n]*/gi,
    /\b(?:link in (?:bio|comments|description|first comment))[^.!?\n]*/gi,
    /\b(?:tag a friend|tag someone|share with a friend)[^.!?\n]*/gi,
    /\b(?:follow\s+(?:me|us|for more|@[\w.]+))[^.!?\n]*/gi,
    /\b(?:like and (?:subscribe|follow|share|retweet))[^.!?\n]*/gi,
    /\b(?:save this (?:post|for later|reel|video))[^.!?\n]*/gi,
    /\b(?:subscribe for more|hit the bell icon)[^.!?\n]*/gi,
    /\b(?:check out the link (?:in|below))[^.!?\n]*/gi,
  ];

  for (const pattern of ctaPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  // Remove standalone or leftover exclamation/dangling emojis from removed CTAs
  cleaned = cleaned.replace(/[💬🚨👉👇🔥🚀]\s*!/g, '').replace(/Follow\s*\+\s*!/gi, '');

  // 3. Remove trailing platform brand watermarks
  cleaned = cleaned
    .replace(/\s*\|\s*(?:Facebook|Twitter|X|Instagram|TikTok|YouTube|LinkedIn)$/i, '')
    .replace(/\s*-\s*(?:Facebook|Twitter|X|Instagram|TikTok|YouTube|LinkedIn)$/i, '')
    .replace(/\s*(?:on\s+Facebook|on\s+X|on\s+Twitter|on\s+Instagram)$/i, '');

  // 4. Remove dangling separator characters & pointing emojis at start or end
  cleaned = cleaned
    .replace(/^[\s·•|\-—:👇👉🔥🚀👀]+/g, '')
    .replace(/[\s·•|\-—:👇👉🔥🚀👀]+$/g, '')
    .replace(/\s*[·•|\-—]\s*$/g, '')
    .replace(/^\s*[·•|\-—]\s*/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // 5. Ensure valid UTF-8 unicode
  if (typeof cleaned.toWellFormed === 'function') {
    cleaned = cleaned.toWellFormed();
  }
  cleaned = cleaned
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '')
    .trim();

  return cleaned;
}

export function generateAISummary(title: string, content: string, type: string = 'link'): string {
  const cleanTitle = cleanSocialText(title ? title.trim() : '');
  const cleanContent = cleanSocialText(content ? content.trim() : '');

  if (!cleanContent && !cleanTitle) {
    return 'Saved item reference in memory.';
  }

  // High-accuracy synthesis for links & web pages
  if (type === 'link' || type === 'pdf') {
    if (cleanContent && !cleanContent.startsWith('http')) {
      const sentences = cleanContent
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 15 && !/\b(javascript|cookie|login|privacy|copyright|rights reserved)\b/i.test(s));

      if (sentences.length >= 2) {
        return `${sentences[0]} ${sentences[1]}`;
      } else if (sentences.length === 1) {
        return sentences[0];
      }
    }

    if (cleanTitle) {
      return `Key insights and reference synthesis for "${cleanTitle}".`;
    }
  }

  // If content is already concise (1-2 sentences), return formatted content
  if (cleanContent.length > 0 && cleanContent.length <= 160 && !cleanContent.startsWith('http')) {
    return cleanContent;
  }

  let summary = '';

  if (cleanContent && !cleanContent.startsWith('http')) {
    const sentences = cleanContent
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.length > 10 && !/\b(javascript|cookie)\b/i.test(s));
    if (sentences.length > 0) {
      summary = sentences.slice(0, 2).join(' ');
    }
  }

  if (!summary) {
    if (type === 'video') {
      summary = cleanTitle
        ? `Video overview: "${cleanTitle}". Key takeaways and media reference.`
        : 'Saved video resource.';
    } else if (type === 'tweet') {
      summary = cleanTitle ? `Social post: "${cleanTitle}".` : 'Saved social update.';
    } else if (type === 'note') {
      summary = cleanContent || cleanTitle || 'Saved quick note in memory.';
    } else if (cleanTitle) {
      summary = `Key insights and notes saved from "${cleanTitle}".`;
    } else {
      summary = 'Saved content reference in memory.';
    }
  }

  if (summary.length > 240) {
    summary = summary.slice(0, 237) + '...';
  }

  return summary;
}
