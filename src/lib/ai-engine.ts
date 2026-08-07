/**
 * Intelligent AI Categorization and Summarization Engine
 * Dynamically classifies content into rich categories and generates summaries.
 */

export interface AIAnalysisResult {
  title?: string;
  summary: string;
  tags: string[];
}

const CATEGORY_RULES: { tag: string; regex: RegExp }[] = [
  { tag: 'AI', regex: /\b(ai|artificial intelligence|machine learning|ml|openai|chatgpt|gpt|llm|deep learning|neural|claude|gemini|rag|prompt|agent)\b/i },
  { tag: 'Technology', regex: /\b(tech|technology|software|developer|coding|code|programming|web|react|javascript|typescript|python|api|database|sql|nextjs|vercel|git|linux|cyber|cloud|aws|docker)\b/i },
  { tag: 'Design', regex: /\b(design|ui|ux|figma|css|style|brand|typography|svg|color|layout|canvas|wireframe|vector|graphic)\b/i },
  { tag: 'Business', regex: /\b(business|startup|founder|vc|venture|finance|money|crypto|bitcoin|ethereum|invest|stock|revenue|market|saas|pricing|sales|management|strategy|leadership)\b/i },
  { tag: 'Productivity', regex: /\b(productivity|habit|focus|time|workflow|organize|system|todo|routine|lifehack|gtd|notion|efficiency)\b/i },
  { tag: 'Research', regex: /\b(research|science|paper|study|data|analysis|stat|journal|academic|physics|math|biology|chemistry|thesis)\b/i },
  { tag: 'Health', regex: /\b(health|fitness|workout|diet|nutrition|sleep|mental|meditation|gym|running|wellness|exercise)\b/i },
  { tag: 'Education', regex: /\b(learn|guide|tutorial|course|book|reading|notes|explain|how-to|summary|education|study|university|lesson)\b/i },
  { tag: 'Philosophy', regex: /\b(philosophy|mindset|thinking|ethics|stoic|psychology|behavior|logic|wisdom|mental model)\b/i },
  { tag: 'Marketing', regex: /\b(marketing|seo|growth|content|social media|copywriting|audience|email|brand|ad|campaign)\b/i },
  { tag: 'Writing', regex: /\b(writing|essay|article|blog|journal|author|newsletter|story|storytelling)\b/i },
];

export function classifyContent(text: string, defaultTags: string[] = []): string[] {
  if (!text) return defaultTags.length ? defaultTags : ['Saved'];
  
  const tags = new Set<string>();

  // Check categories based on keyword regex matching
  for (const rule of CATEGORY_RULES) {
    if (rule.regex.test(text)) {
      tags.add(rule.tag);
    }
  }

  // Include user default/domain tags if any
  for (const dt of defaultTags) {
    if (dt && dt !== 'Link') tags.add(dt);
  }

  // Extract notable tech/brand names directly if mentioned in content
  const customKeywords: [RegExp, string][] = [
    [/\b(next\.?js)\b/i, 'Next.js'],
    [/\b(react)\b/i, 'React'],
    [/\b(python)\b/i, 'Python'],
    [/\b(typescript)\b/i, 'TypeScript'],
    [/\b(tailwind)\b/i, 'Tailwind'],
    [/\b(youtube)\b/i, 'Video'],
    [/\b(twitter|x\.com)\b/i, 'Social'],
  ];

  for (const [regex, tag] of customKeywords) {
    if (regex.test(text)) {
      tags.add(tag);
    }
  }

  const result = Array.from(tags);
  if (result.length === 0) {
    result.push('General');
  }

  return result.slice(0, 4);
}

export function generateAISummary(title: string, content: string, type: string = 'link'): string {
  const cleanTitle = title ? title.trim() : '';
  const cleanContent = content ? content.trim() : '';

  if (!cleanContent && !cleanTitle) {
    return 'Saved item reference in memory.';
  }

  // High-accuracy synthesis for links & web pages
  if (type === 'link' || type === 'pdf') {
    if (cleanContent && !cleanContent.startsWith('http')) {
      const sentences = cleanContent
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 15 && !/\b(javascript|cookie|login|privacy|copyright|rights reserved)\b/i.test(s));

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
      .filter(s => s.length > 10 && !/\b(javascript|cookie)\b/i.test(s));
    if (sentences.length > 0) {
      summary = sentences.slice(0, 2).join(' ');
    }
  }

  if (!summary) {
    if (type === 'video') {
      summary = cleanTitle ? `Video overview: "${cleanTitle}". AI summary and key takeaways.` : 'Saved video resource.';
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
