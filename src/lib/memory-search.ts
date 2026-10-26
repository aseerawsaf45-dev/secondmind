import type { MemoryItem } from '@/lib/data';
import { getPrimaryCategory } from '@/lib/categories';

/**
 * Natural Language Stop Words
 * Stripped during conversational queries ("what did I save about deep work" -> "deep work")
 */
export const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could',
  'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'explain', 'few', 'find', 'for', 'from', 'further', 'get',
  'give', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'note', 'notes', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours',
  'ourselves', 'out', 'over', 'own', 'please', 'same', 'save', 'saved', 'search', 'should', 'show', 'so', 'some',
  'such', 'tell', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
  'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'won\'t', 'would', 'you', 'your', 'yours', 'yourself',
  'yourselves'
]);

export const QUESTION_INDICATORS = new Set([
  'what', 'how', 'why', 'who', 'where', 'when', 'which', 'tell', 'explain', 'summarize',
  'find', 'can', 'should', 'is', 'are', 'do', 'does', 'show', 'give', 'any', 'best',
  'resources', 'research', 'ideas', 'principles', 'laws', 'models', 'guide', 'tips',
  'advice', 'workflow', 'architecture'
]);

/**
 * Extract both raw and meaningful (non-stop) tokens from a user query
 */
export function extractQueryTokens(query: string): { rawTokens: string[]; meaningfulTokens: string[] } {
  const clean = (query || '').toLowerCase().trim();
  if (!clean) {
    return { rawTokens: [], meaningfulTokens: [] };
  }

  const rawTokens = clean
    .split(/[\s,.;:?!+/"'()[\]{}#&@\-_/\\|<>]+/)
    .map(t => t.trim())
    .filter(t => t.length > 0);

  const meaningfulTokens = rawTokens.filter(t => !STOP_WORDS.has(t) && t.length >= 2);

  return {
    rawTokens,
    meaningfulTokens: meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens,
  };
}

/**
 * Score a memory item against a natural query and token set with high-signal weighting
 */
export function scoreMemoryItem(item: MemoryItem, rawQuery: string, tokens: string[]): number {
  if (!item) return 0;
  const q = (rawQuery || '').toLowerCase().trim();
  if (!q) return 0;

  const title = String(item.title || '').toLowerCase();
  const summary = String(item.summary || '').toLowerCase();
  const content = String(item.content || '').toLowerCase();
  const domain = String(item.sourceDomain || '').toLowerCase();
  const tags = (Array.isArray(item.tags) ? item.tags : []).map(t => String(t || '').toLowerCase());
  const type = String(item.type || '').toLowerCase();

  let score = 0;

  // 1. Exact phrase matches (highest confidence)
  if (title.includes(q)) score += 200;
  if (tags.some(t => t.includes(q))) score += 150;
  if (summary.includes(q)) score += 100;
  if (content.includes(q)) score += 40;

  // 2. Multi-token matches
  let matchedCount = 0;
  for (const token of tokens) {
    let hit = false;

    // Exact Tag match or prefix
    if (tags.some(t => t === token)) {
      score += 50;
      hit = true;
    } else if (tags.some(t => t.includes(token))) {
      score += 25;
      hit = true;
    }

    // Title match
    if (title === token) {
      score += 70;
      hit = true;
    } else if (title.startsWith(token) || title.includes(` ${token}`)) {
      score += 45;
      hit = true;
    } else if (title.includes(token)) {
      score += 30;
      hit = true;
    }

    // Summary & Content
    if (summary.includes(token)) {
      score += 20;
      hit = true;
    }
    if (content.includes(token)) {
      score += 10;
      hit = true;
    }

    // Domain / Type
    if (domain.includes(token)) {
      score += 25;
      hit = true;
    }
    if (type === token) {
      score += 15;
      hit = true;
    }

    if (hit) {
      matchedCount++;
    }
  }

  // Bonus when all extracted tokens are satisfied
  if (tokens.length > 0 && matchedCount === tokens.length) {
    score += 90;
  } else if (matchedCount > 0) {
    score += (matchedCount / tokens.length) * 45;
  }

  // Small preference for favorites
  if (score > 0 && item.isFavorite) {
    score += 5;
  }

  return score;
}

/**
 * Rank memories instantaneously (0ms) on client memory state
 */
export function searchAndRankMemories(items: MemoryItem[], query: string): MemoryItem[] {
  const clean = (query || '').trim();
  if (!clean || !Array.isArray(items) || items.length === 0) {
    return [];
  }

  const { meaningfulTokens } = extractQueryTokens(clean);
  const scored: Array<{ item: MemoryItem; score: number }> = [];

  for (const item of items) {
    const score = scoreMemoryItem(item, clean, meaningfulTokens);
    if (score > 0) {
      scored.push({ item, score });
    }
  }

  // Sort by score descending, then newest date
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const timeA = new Date(a.item.createdAt || 0).getTime();
    const timeB = new Date(b.item.createdAt || 0).getTime();
    return timeB - timeA;
  });

  return scored.map(s => s.item);
}

export interface Citation {
  id: string;
  title: string;
  type: string;
  category: string;
  categoryColor: string;
}

export interface SynthesizedAnswer {
  isQuestion: boolean;
  headline: string;
  answer: string;
  keyTakeaway: string;
  citations: Citation[];
}

/**
 * Synthesize a cited AI answer from the top matched memories in the vault
 */
export function synthesizeVaultAnswer(query: string, matchedItems: MemoryItem[]): SynthesizedAnswer | null {
  const clean = (query || '').trim();
  if (!clean || !Array.isArray(matchedItems) || matchedItems.length === 0) {
    return null;
  }

  const { rawTokens, meaningfulTokens } = extractQueryTokens(clean);
  const isDirectQuestion =
    clean.includes('?') ||
    rawTokens.some(t => QUESTION_INDICATORS.has(t)) ||
    meaningfulTokens.some(t => QUESTION_INDICATORS.has(t));

  // Synthesize from the top 1 to 3 items
  const topItems = matchedItems.slice(0, 3);
  const primary = topItems[0];
  const secondary = topItems[1];

  const primaryInsight = (primary.summary || primary.content || primary.title || '').trim();
  const cleanPrimary = primaryInsight.replace(/[.\s]+$/, '');

  let combinedAnswer = '';
  if (secondary && secondary.id !== primary.id) {
    const secondaryInsight = (secondary.summary || secondary.content || secondary.title || '').trim().replace(/[.\s]+$/, '');
    combinedAnswer = `${cleanPrimary}. Furthermore, reference to "${secondary.title}" highlights: ${secondaryInsight}.`;
  } else {
    combinedAnswer = `${cleanPrimary}.`;
  }

  // Format citations with primary category and theme color
  const citations: Citation[] = topItems.map(item => {
    const cat = getPrimaryCategory(item.tags, `${item.title} ${item.content}`, item.url);
    return {
      id: item.id,
      title: item.title || 'Untitled Memory',
      type: item.type || 'link',
      category: cat.name,
      categoryColor: cat.color,
    };
  });

  const headline = isDirectQuestion
    ? `Synthesized answer from ${topItems.length} vault source${topItems.length > 1 ? 's' : ''}`
    : `Key synthesis for "${clean}" across your memories`;

  return {
    isQuestion: isDirectQuestion,
    headline,
    answer: combinedAnswer,
    keyTakeaway: primary.summary || primary.title || 'Saved memory insight',
    citations,
  };
}
