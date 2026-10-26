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
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    const host = parsed.hostname.toLowerCase();
    return (
      host === 'facebook.com' ||
      host.endsWith('.facebook.com') ||
      host === 'fb.watch' ||
      host.endsWith('.fb.watch') ||
      host === 'fb.me' ||
      host === 'fb.com'
    );
  } catch {
    return false;
  }
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

function escapeXml(unsafe: string): string {
  return (unsafe || '').replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Generates a modern, high-definition Facebook preview card as an SVG data URL.
 * Guaranteed to never fail, get blocked, or show broken image placeholders.
 */
export function generateFacebookThumbnailSvg(
  title: string = 'Facebook Post',
  type: string = 'link',
  author?: string
): string {
  const isVideo = type === 'video' || type === 'reel';
  const typeLabel = type === 'reel' ? 'REEL' : type === 'video' ? 'VIDEO' : type === 'group' ? 'GROUP' : 'POST';
  const cleanTitle = escapeXml((title || 'Facebook Content').slice(0, 68));
  const authorText = author ? `by ${escapeXml(author.slice(0, 32))}` : 'Facebook Media';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#081026"/>
      <stop offset="45%" stop-color="#0d234a"/>
      <stop offset="100%" stop-color="#050a18"/>
    </linearGradient>
    <linearGradient id="fbBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2b7eff"/>
      <stop offset="100%" stop-color="#0866ff"/>
    </linearGradient>
    <radialGradient id="radialOrb" cx="80%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#1877F2" stop-opacity="0.38"/>
      <stop offset="65%" stop-color="#081026" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="1200" height="675" fill="url(#bg)"/>
  <rect width="1200" height="675" fill="url(#grid)"/>
  <circle cx="960" cy="180" r="460" fill="url(#radialOrb)"/>
  <circle cx="180" cy="540" r="320" fill="rgba(8, 102, 255, 0.14)"/>

  <!-- Top Ambient Glow -->
  <rect x="0" y="0" width="1200" height="4" fill="url(#fbBlue)"/>

  <!-- Left Content Container -->
  <g transform="translate(90, 110)">
    <!-- Facebook Brand Badge & Type Pill -->
    <g>
      <!-- FB App Icon -->
      <rect width="64" height="64" rx="16" fill="url(#fbBlue)"/>
      <path d="M42 34 h -7 v 24 h -9 v -24 h -5 v -8 h 5 v -5 c 0 -7 4 -11 11 -11 h 6 v 8 h -4 c -3 0 -4 1 -4 4 v 4 h 8 z" fill="#ffffff"/>

      <!-- Type Pill -->
      <rect x="80" y="14" width="${typeLabel.length * 14 + 34}" height="36" rx="8" fill="rgba(8, 102, 255, 0.25)" stroke="rgba(43, 126, 255, 0.55)" stroke-width="1.5"/>
      <text x="97" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#67E8F9" letter-spacing="1.5">${typeLabel}</text>

      <!-- Domain -->
      <text x="${80 + typeLabel.length * 14 + 50}" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="rgba(255, 255, 255, 0.5)">facebook.com</text>
    </g>

    <!-- Title -->
    <text x="0" y="190" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="700" fill="#ffffff" letter-spacing="-0.5">
      ${cleanTitle}
    </text>

    <!-- Author & Meta -->
    <text x="0" y="250" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="500" fill="rgba(255, 255, 255, 0.7)">
      ${authorText}
    </text>
  </g>

  <!-- Video / Reel Center Play Overlay -->
  ${isVideo ? `
  <g transform="translate(600, 360)">
    <circle r="52" fill="rgba(7, 8, 15, 0.75)" stroke="rgba(255, 255, 255, 0.35)" stroke-width="2"/>
    <polygon points="-12,-20 22,0 -12,20" fill="#ffffff"/>
  </g>` : ''}

  <!-- Bottom Brand Watermark -->
  <g transform="translate(90, 595)">
    <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="rgba(255, 255, 255, 0.35)" letter-spacing="0.5">
      SecondMind • Social Media Memory
    </text>
  </g>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Returns a guaranteed valid thumbnail URL for any Facebook link.
 */
export function getFacebookThumbnailUrl(url: string, title?: string, author?: string): string {
  if (!url) return generateFacebookThumbnailSvg(title, 'link', author);
  const cleanUrl = cleanFacebookUrl(url);
  const parsedMeta = parseFacebookUrl(cleanUrl);
  const resolvedAuthor = author || parsedMeta.authorOrGroup;

  return generateFacebookThumbnailSvg(title || 'Facebook Post', parsedMeta.type, resolvedAuthor);
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

  // 1. Attempt to fetch Open Graph metadata with crawler User-Agent
  if (isFacebookUrl(cleanUrl)) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

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
        const rawHtml = await res.text();
        const html = rawHtml.slice(0, 2 * 1024 * 1024);
        const $ = cheerio.load(html);

        const rawTitle = $('meta[property="og:title"]').attr('content') || $('meta[name="twitter:title"]').attr('content') || $('title').text() || '';
        const rawDesc = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || $('meta[name="twitter:description"]').attr('content') || '';
        const rawImg = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || '';

        const isLoginWall = /\b(log in|sign up|log into facebook|welcome to facebook|facebook - log in|log in or sign up)\b/i.test(rawTitle);

        if (!isLoginWall && rawTitle.trim()) {
          ogTitle = rawTitle.trim();
        }
        if (!isLoginWall && rawDesc.trim() && !/\b(log in|sign up)\b/i.test(rawDesc)) {
          ogDescription = rawDesc.trim();
        }
        if (rawImg && !rawImg.includes('facebook.com/images/fb_icon') && !rawImg.includes('data:image/svg')) {
          ogImage = rawImg;
        }
      }
    } catch {
      // Network or abort fallback
    }
  }

  // 2. If author/page exists and no image, try Facebook Graph picture endpoint
  if (!ogImage && author && /^[a-zA-Z0-9._-]+$/.test(author) && !/^\d+$/.test(author)) {
    try {
      const graphRes = await fetch(`https://graph.facebook.com/${encodeURIComponent(author)}/picture?type=large&redirect=false`, {
        signal: AbortSignal.timeout(3000),
      });
      if (graphRes.ok) {
        const graphData = await graphRes.json();
        if (graphData?.data?.url && !graphData.data.is_silhouette) {
          ogImage = graphData.data.url;
        }
      }
    } catch {
      // Fallback
    }
  }

  // If author wasn't extracted from URL, try extracting from OG title
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
  const defaultTags = ['Facebook'];
  if (isVideo) defaultTags.push('Video');
  if (parsedMeta.type === 'group') defaultTags.push('Community');

  const contentToClassify = `${finalTitle} ${cleanedDesc} ${author}`;
  const classifiedTags = classifyContent(contentToClassify, defaultTags, {
    title: finalTitle,
    url,
    maxTags: 4,
  });

  // Guaranteed fallback thumbnail if no external non-Facebook-CDN image was provided
  const finalImage = (ogImage && !ogImage.includes('fbcdn.net') && !ogImage.includes('facebook.com'))
    ? ogImage
    : generateFacebookThumbnailSvg(finalTitle, parsedMeta.type, author);

  return {
    title: finalTitle,
    description: finalSummary,
    image: finalImage,
    tags: classifiedTags,
    type: isVideo ? 'video' : 'link',
    author: author || undefined,
    sourceDomain: 'facebook.com',
  };
}
