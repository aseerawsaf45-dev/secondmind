import * as cheerio from 'cheerio';
import { classifyContent, generateAISummary, cleanSocialText } from '@/lib/ai-engine';

export interface FacebookExtractedData {
  title: string;
  description: string;
  image?: string;
  tags: string[];
  type: 'video' | 'link';
  author?: string;
  sourceDomain: string;
}

/**
 * Checks if a given URL is a Facebook link.
 */
export function isFacebookUrl(url: string): boolean {
  if (!url) return false;
  return /(?:https?:\/\/)?(?:www\.|m\.|web\.|touch\.|l\.)?(?:facebook\.com|fb\.watch|fb\.me|fb\.com)\b/i.test(url);
}

/**
 * Strips tracking parameters from Facebook URLs.
 */
export function cleanFacebookUrl(url: string): string {
  try {
    let clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    const parsed = new URL(clean);
    
    // Remove typical Facebook tracking query params
    const trackingParams = ['fbclid', 'mibextid', 'rdid', 'ref', 'sfnsn', '__cft__', '__tn__', 'hrc', '_rdr'];
    trackingParams.forEach(param => parsed.searchParams.delete(param));
    
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Analyzes Facebook URL patterns to determine post type and potential identifiers.
 */
export function parseFacebookUrl(url: string): {
  type: 'reel' | 'video' | 'post' | 'group' | 'photo' | 'profile' | 'story' | 'link';
  id?: string;
  authorOrGroup?: string;
} {
  const clean = cleanFacebookUrl(url);
  try {
    const parsed = new URL(clean);
    const pathname = parsed.pathname;

    if (/fb\.watch/i.test(parsed.hostname) || /\/reel\/|\/reels\//i.test(pathname)) {
      const reelMatch = pathname.match(/\/reel(?:s)?\/([0-9a-zA-Z_-]+)/);
      return { type: 'reel', id: reelMatch?.[1] };
    }

    if (/\/watch/i.test(pathname) || /\/videos\//i.test(pathname)) {
      const vParam = parsed.searchParams.get('v');
      const vMatch = pathname.match(/\/videos\/([0-9]+)/);
      return { type: 'video', id: vParam || vMatch?.[1] };
    }

    if (/\/groups\/([^\/]+)\/(?:posts|permalink)\/([0-9a-zA-Z_-]+)/i.test(pathname)) {
      const match = pathname.match(/\/groups\/([^\/]+)\/(?:posts|permalink)\/([0-9a-zA-Z_-]+)/i);
      return { type: 'group', authorOrGroup: match?.[1], id: match?.[2] };
    }

    if (/\/groups\/([^\/]+)/i.test(pathname)) {
      const match = pathname.match(/\/groups\/([^\/]+)/);
      return { type: 'group', authorOrGroup: match?.[1] };
    }

    if (/\/photo(?:\.php|\/)/i.test(pathname)) {
      const fbid = parsed.searchParams.get('fbid');
      return { type: 'photo', id: fbid || undefined };
    }

    if (/\/stories\//i.test(pathname)) {
      return { type: 'story' };
    }

    if (/\/posts\/|\/share\/p\/|story_fbid/i.test(clean)) {
      const postMatch = pathname.match(/\/([^\/]+)\/posts\/([0-9a-zA-Z_-]+)/i) || pathname.match(/\/share\/p\/([0-9a-zA-Z_-]+)/i);
      return {
        type: 'post',
        authorOrGroup: postMatch?.[1] && postMatch[1] !== 'share' ? postMatch[1] : undefined,
        id: postMatch?.[2] || postMatch?.[1]
      };
    }

    // Likely a profile or page
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 1 && !['home', 'watch', 'marketplace', 'gaming', 'groups'].includes(segments[0].toLowerCase())) {
      return { type: 'profile', authorOrGroup: segments[0] };
    }

    return { type: 'link' };
  } catch {
    return { type: 'link' };
  }
}

/**
 * Extracts and analyzes Facebook link content, generates tags, and synthesizes a brief.
 */
export async function extractFacebookMetadata(url: string): Promise<FacebookExtractedData> {
  const cleanUrl = cleanFacebookUrl(url);
  const parsedMeta = parseFacebookUrl(cleanUrl);
  const isVideo = parsedMeta.type === 'video' || parsedMeta.type === 'reel';

  let ogTitle = '';
  let ogDescription = '';
  let ogImage = '';
  let author = parsedMeta.authorOrGroup || '';

  // Attempt to fetch Open Graph metadata with crawler User-Agent
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(cleanUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);

      const rawTitle = $('meta[property="og:title"]').attr('content') || $('meta[name="twitter:title"]').attr('content') || $('title').text() || '';
      const rawDesc = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || $('meta[name="twitter:description"]').attr('content') || '';
      const rawImg = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || '';

      // Check if response is a generic login block
      const isLoginWall = /\b(log in|sign up|log into facebook|welcome to facebook|facebook - log in|log in or sign up)\b/i.test(rawTitle);

      if (!isLoginWall && rawTitle.trim()) {
        ogTitle = rawTitle.trim();
      }
      if (!isLoginWall && rawDesc.trim() && !/\b(log in|sign up)\b/i.test(rawDesc)) {
        ogDescription = rawDesc.trim();
      }
      if (rawImg && !rawImg.includes('facebook.com/images/fb_icon')) {
        ogImage = rawImg;
      }
    }
  } catch (err) {
    // Network or abort fallback
  }

  // If author wasn't extracted from URL, try extracting from OG title (e.g. "Author Name - Video Title | Facebook")
  if (!author && ogTitle) {
    const authorMatch = ogTitle.match(/^([^|\-•]+)(?:[|\-•]|\s+on\s+Facebook)/i);
    if (authorMatch && authorMatch[1].length < 40) {
      author = authorMatch[1].trim();
    }
  }

  // Construct readable title
  let finalTitle = ogTitle;
  if (!finalTitle) {
    if (parsedMeta.type === 'reel') {
      finalTitle = author ? `Facebook Reel by ${author}` : 'Facebook Reel';
    } else if (parsedMeta.type === 'video') {
      finalTitle = author ? `Facebook Video by ${author}` : 'Facebook Video';
    } else if (parsedMeta.type === 'group') {
      finalTitle = author ? `Facebook Group: ${author}` : 'Facebook Group Post';
    } else if (parsedMeta.type === 'profile') {
      finalTitle = author ? `Facebook Profile: @${author}` : 'Facebook Profile';
    } else if (parsedMeta.type === 'photo') {
      finalTitle = author ? `Facebook Photo by ${author}` : 'Facebook Photo';
    } else {
      finalTitle = author ? `Facebook Post by ${author}` : 'Facebook Post';
    }
  }

  // Clean title from trailing "| Facebook" or "- Facebook" and social metrics
  finalTitle = cleanSocialText(finalTitle);

  let finalSummary = '';
  const cleanedDesc = cleanSocialText(ogDescription);

  if (cleanedDesc && cleanedDesc.length > 20) {
    finalSummary = generateAISummary(finalTitle, cleanedDesc, isVideo ? 'video' : 'link');
  } else {
    if (parsedMeta.type === 'reel' || parsedMeta.type === 'video') {
      finalSummary = author
        ? `Facebook ${parsedMeta.type === 'reel' ? 'Reel' : 'video'} by ${author}. Saved video media with notes and key takeaways.`
        : 'Facebook video content and media resource saved to memory.';
    } else if (parsedMeta.type === 'group') {
      finalSummary = author
        ? `Community discussion and insights from the "${author}" Facebook group.`
        : 'Facebook group post and community discussion reference.';
    } else if (parsedMeta.type === 'profile') {
      finalSummary = author
        ? `Facebook page and updates for ${author}.`
        : 'Facebook profile and social media link.';
    } else {
      finalSummary = author
        ? `Social post and shared update by ${author} on Facebook.`
        : 'Saved Facebook post and social update reference.';
    }
  }

  // Tag classification
  const defaultTags = ['Facebook', 'Social'];
  if (isVideo) defaultTags.push('Video');
  if (parsedMeta.type === 'group') defaultTags.push('Community');

  const contentToClassify = `${finalTitle} ${cleanedDesc} ${author} facebook social`;
  const classifiedTags = classifyContent(contentToClassify, defaultTags);

  // Ensure 'Facebook' and 'Social' are always present
  const tagsSet = new Set<string>(['Facebook', 'Social', ...classifiedTags]);
  if (isVideo) tagsSet.add('Video');

  return {
    title: finalTitle,
    description: finalSummary,
    image: ogImage || undefined,
    tags: Array.from(tagsSet).slice(0, 4),
    type: isVideo ? 'video' : 'link',
    author: author || undefined,
    sourceDomain: 'facebook.com',
  };
}
