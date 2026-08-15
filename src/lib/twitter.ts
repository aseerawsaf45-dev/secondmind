import * as cheerio from 'cheerio';
import { classifyContent, generateAISummary, cleanSocialText } from '@/lib/ai-engine';

export interface TwitterExtractedData {
  title: string;
  description: string;
  image?: string;
  tags: string[];
  type: 'tweet' | 'link';
  author?: string;
  sourceDomain: string;
}

/**
 * Checks if a given URL is an X or Twitter link.
 */
export function isTwitterUrl(url: string): boolean {
  if (!url) return false;
  return /(?:https?:\/\/)?(?:www\.|mobile\.)?(?:twitter\.com|x\.com)\b/i.test(url);
}

/**
 * Cleans tracking parameters from X / Twitter URLs.
 */
export function cleanTwitterUrl(url: string): string {
  try {
    let clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    const parsed = new URL(clean);
    
    // Remove query params like ?s=20&t=xyz
    const trackingParams = ['s', 't', 'ref_src', 'ref_url', 'mx', 'twclid'];
    trackingParams.forEach(param => parsed.searchParams.delete(param));
    
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Extracts username and tweet ID from an X / Twitter link.
 */
export function parseTwitterUrl(url: string): {
  type: 'tweet' | 'profile' | 'space' | 'link';
  username?: string;
  tweetId?: string;
} {
  const clean = cleanTwitterUrl(url);
  try {
    const parsed = new URL(clean);
    const pathname = parsed.pathname;

    const tweetMatch = pathname.match(/\/([A-Za-z0-9_]+)\/status(?:es)?\/([0-9]+)/);
    if (tweetMatch) {
      return {
        type: 'tweet',
        username: tweetMatch[1],
        tweetId: tweetMatch[2],
      };
    }

    if (/\/i\/spaces\/([A-Za-z0-9_]+)/i.test(pathname)) {
      return { type: 'space' };
    }

    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 1 && !['home', 'explore', 'notifications', 'messages', 'search', 'i'].includes(segments[0].toLowerCase())) {
      return {
        type: 'profile',
        username: segments[0],
      };
    }

    return { type: 'link' };
  } catch {
    return { type: 'link' };
  }
}

/**
 * Extracts and analyzes X / Twitter link content, tags, and summary.
 */
export async function extractTwitterMetadata(url: string): Promise<TwitterExtractedData> {
  const cleanUrl = cleanTwitterUrl(url);
  const parsedMeta = parseTwitterUrl(cleanUrl);

  let tweetText = '';
  let authorName = parsedMeta.username || '';
  let mediaImage = '';

  // 1. Try Twitter's official publish oEmbed endpoint
  try {
    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(cleanUrl)}&omit_script=true`;
    const res = await fetch(oembedUrl, {
      signal: AbortSignal.timeout(3500),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SecondMind/1.0)' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.author_name) authorName = data.author_name;
      if (data.html) {
        const $ = cheerio.load(data.html);
        const pText = $('blockquote.twitter-tweet p').text();
        if (pText) tweetText = pText.trim();
      }
    }
  } catch {
    // Fallback below
  }

  // 2. If oEmbed didn't provide text or we need media image, query vxtwitter/fxtwitter API
  if ((!tweetText || !mediaImage) && parsedMeta.username && parsedMeta.tweetId) {
    try {
      const apiUrl = `https://api.vxtwitter.com/${parsedMeta.username}/status/${parsedMeta.tweetId}`;
      const res = await fetch(apiUrl, {
        signal: AbortSignal.timeout(3500),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SecondMind/1.0)' },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.text && !tweetText) tweetText = data.text;
        if (data.user_name) authorName = data.user_name;
        if (data.mediaURLs && data.mediaURLs.length > 0) {
          mediaImage = data.mediaURLs[0];
        }
      }
    } catch {
      // Fallback below
    }
  }

  // Clean raw tweet text from engagement spam & metrics
  const cleanTweet = cleanSocialText(tweetText);

  // 3. Construct Title
  let finalTitle = '';
  if (parsedMeta.type === 'profile') {
    finalTitle = authorName ? `${authorName} (@${parsedMeta.username || authorName}) on X` : 'X Profile';
  } else if (parsedMeta.type === 'space') {
    finalTitle = 'X Space Audio Broadcast';
  } else if (cleanTweet) {
    const snippet = cleanTweet.length > 70 ? cleanTweet.slice(0, 67) + '...' : cleanTweet;
    finalTitle = authorName ? `${authorName} on X: "${snippet}"` : snippet;
  } else {
    finalTitle = authorName ? `Post by @${authorName} on X` : 'X (Twitter) Post';
  }

  finalTitle = cleanSocialText(finalTitle);

  // 4. Construct Brief & AI Summary
  let finalSummary = '';
  if (cleanTweet) {
    finalSummary = generateAISummary(finalTitle, cleanTweet, 'tweet');
  } else if (parsedMeta.type === 'profile') {
    finalSummary = authorName
      ? `X / Twitter profile and updates from ${authorName}.`
      : 'X / Twitter profile link saved to memory.';
  } else {
    finalSummary = authorName
      ? `Social post by @${authorName} on X (Twitter).`
      : 'Saved post from X (Twitter).';
  }

  // 5. Generate Tags
  const contentToClassify = `${finalTitle} ${cleanTweet} ${authorName} twitter x social`;
  const classifiedTags = classifyContent(contentToClassify, ['Social', 'X']);
  
  const tagsSet = new Set<string>(['Social', 'X', ...classifiedTags]);
  
  return {
    title: finalTitle,
    description: finalSummary,
    image: mediaImage || undefined,
    tags: Array.from(tagsSet).slice(0, 4),
    type: 'tweet',
    author: authorName || undefined,
    sourceDomain: 'x.com',
  };
}
