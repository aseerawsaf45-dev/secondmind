import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { extractYouTubeVideoId, fetchYouTubeOEmbed, isYouTubeUrl, getYouTubeThumbnailUrl } from '@/lib/youtube';
import { isFacebookUrl, extractFacebookMetadata } from '@/lib/facebook';
import { isTwitterUrl, extractTwitterMetadata } from '@/lib/twitter';
import { classifyContent, synthesizeContentWithAI } from '@/lib/ai-engine';

function isSafePublicUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const rawHostname = parsed.hostname.toLowerCase();
    const cleanHost = rawHostname.replace(/^\[|\]$/g, '');

    // Block localhost, loopback, and unassigned
    if (
      cleanHost === 'localhost' ||
      cleanHost === '127.0.0.1' ||
      cleanHost === '0.0.0.0' ||
      cleanHost === '::1' ||
      cleanHost === '::' ||
      cleanHost.endsWith('.localhost')
    ) {
      return false;
    }

    // Block single-integer IP notation (e.g. 2130706433)
    if (/^\d+$/.test(cleanHost)) {
      return false;
    }

    // Block Cloud metadata link-local addresses
    if (cleanHost.startsWith('169.254.') || cleanHost === 'metadata.google.internal' || cleanHost.endsWith('.metadata.google.internal')) {
      return false;
    }

    // Block RFC 1918 private IPv4 ranges
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleanHost)) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(cleanHost)) return false;
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(cleanHost)) return false;
    if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleanHost)) return false;
    // Block Carrier-Grade NAT (RFC 6598)
    if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d{1,3}\.\d{1,3}$/.test(cleanHost)) return false;

    // Block IPv6 link-local and unique-local / mapped IPv4
    if (
      cleanHost.startsWith('fe80:') ||
      cleanHost.startsWith('fc') ||
      cleanHost.startsWith('fd') ||
      cleanHost.includes('::ffff:')
    ) {
      return false;
    }

    // Block internal network domain extensions
    if (
      cleanHost.endsWith('.internal') ||
      cleanHost.endsWith('.local') ||
      cleanHost.endsWith('.lan') ||
      cleanHost.endsWith('.corp') ||
      cleanHost.endsWith('.home') ||
      cleanHost.endsWith('.arpa')
    ) {
      return false;
    }

    // Only allow standard web ports
    if (parsed.port && !['80', '443', '8080', '8443'].includes(parsed.port)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Validates each hop in redirect chains to prevent Open-Redirect SSRF bypasses.
 */
async function safeFetch(url: string, signal: AbortSignal, maxRedirects = 3): Promise<Response | null> {
  let currentUrl = url;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    if (!isSafePublicUrl(currentUrl)) {
      return null;
    }

    const res = await fetch(currentUrl, {
      signal,
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get('location');
      if (!location) return null;
      try {
        const nextUrl = new URL(location, currentUrl).toString();
        currentUrl = nextUrl;
        continue;
      } catch {
        return null;
      }
    }

    return res;
  }
  return null;
}

export async function POST(request: Request) {
  let targetUrl = '';
  let rawText = '';
  try {
    const body = await request.json();
    targetUrl = (body.url || '').trim();
    rawText = (body.text || body.content || '').trim();

    // 1. If only text/note is provided (Quick Note tab)
    if (!targetUrl && rawText) {
      const generatedTitle = rawText.length > 50 ? rawText.slice(0, 50).trim() + '...' : rawText;
      const aiResult = await synthesizeContentWithAI({
        title: generatedTitle,
        text: rawText,
        contentType: 'note',
      });

      return NextResponse.json({
        title: generatedTitle,
        description: aiResult.summary,
        category: aiResult.category,
        categoryEmoji: aiResult.categoryEmoji,
        categoryColor: aiResult.categoryColor,
        image: '',
        tags: Array.from(new Set(['Note', ...aiResult.tags])),
        keyTakeaways: aiResult.keyTakeaways,
      });
    }

    if (!targetUrl) {
      const correlationId = crypto.randomUUID();
      return NextResponse.json(
        { error: 'Missing URL or text', correlationId },
        { status: 400 }
      );
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    if (!isSafePublicUrl(targetUrl)) {
      return NextResponse.json(
        { error: 'Invalid or restricted URL provided.' },
        { status: 400 }
      );
    }

    const domain = new URL(targetUrl).hostname.replace('www.', '');

    // 2. Specialized YouTube extraction
    if (isYouTubeUrl(targetUrl)) {
      const videoId = extractYouTubeVideoId(targetUrl);
      const oembed = await fetchYouTubeOEmbed(targetUrl);

      const ytTitle = oembed?.title || `YouTube Video (${videoId || domain})`;
      const author = oembed?.author_name ? `by ${oembed.author_name}` : '';
      const ytDescription = oembed?.title 
        ? `Watch "${oembed.title}" ${author}. Video notes and key insights captured from YouTube.`
        : `YouTube Video ${author}`;
      const ytThumbnail = oembed?.thumbnail_url || (videoId ? getYouTubeThumbnailUrl(videoId) : '');

      const tags = classifyContent(`${ytTitle} ${ytDescription} youtube video`, ['Video'], {
        title: ytTitle,
        url: targetUrl,
      });

      return NextResponse.json({
        title: ytTitle.trim(),
        description: ytDescription.trim(),
        image: ytThumbnail || '',
        tags,
        type: 'video',
      });
    }

    // 3. Specialized Facebook extraction
    if (isFacebookUrl(targetUrl)) {
      const fbData = await extractFacebookMetadata(targetUrl);
      return NextResponse.json({
        title: fbData.title,
        description: fbData.description,
        image: fbData.image || '',
        tags: fbData.tags,
        type: fbData.type,
      });
    }

    // 4. Specialized X (Twitter) extraction
    if (isTwitterUrl(targetUrl)) {
      const twData = await extractTwitterMetadata(targetUrl);
      return NextResponse.json({
        title: twData.title,
        description: twData.description,
        image: twData.image || '',
        tags: twData.tags,
        type: twData.type,
      });
    }

    // 5. General web page extraction via Cheerio
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    let res: Response | null = null;
    try {
      res = await safeFetch(targetUrl, controller.signal, 3);
    } catch {
      res = null;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res || !res.ok) {
      const fallbackTitle = domain;
      const fallbackSummary = `Saved bookmark from ${domain}.`;
      const fallbackTags = classifyContent(`${domain} ${targetUrl}`, [], {
        title: domain,
        url: targetUrl,
      });

      return NextResponse.json({
        title: fallbackTitle,
        description: fallbackSummary,
        image: '',
        tags: fallbackTags,
      });
    }

    const contentType = res.headers.get('content-type') || '';
    const isDirectImage = contentType.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(targetUrl);

    if (isDirectImage) {
      const fileName = targetUrl.split('/').pop()?.split('?')[0] || domain;
      return NextResponse.json({
        title: fileName,
        description: `Direct image from ${domain}.`,
        category: 'Media & Reads',
        categoryEmoji: '🎬',
        categoryColor: '#E11D48',
        image: targetUrl,
        tags: ['Image', 'Media'],
      });
    }

    if (contentType && !/text\/html|text\/plain|application\/xhtml\+xml|application\/xml/i.test(contentType)) {
      return NextResponse.json({
        title: domain,
        description: `Saved bookmark from ${domain}.`,
        image: `https://image.thum.io/get/width/600/crop/800/${targetUrl}`,
        tags: classifyContent(`${domain} ${targetUrl}`, [], { title: domain, url: targetUrl }),
      });
    }

    const rawTextResponse = await res.text();
    // Cap memory buffer to 2MB to prevent memory exhaustion
    const html = rawTextResponse.slice(0, 2 * 1024 * 1024);
    const $ = cheerio.load(html);

    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || domain;
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    
    // Comprehensive image discovery across OpenGraph, Twitter Cards, article body, and touch icons
    const rawImage = (
      $('meta[property="og:image:secure_url"]').attr('content') ||
      $('meta[property="og:image:url"]').attr('content') ||
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image:src"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('meta[property="twitter:image"]').attr('content') ||
      $('link[rel="image_src"]').attr('href') ||
      $('article img, main img, .post-content img, .entry-content img').first().attr('src') ||
      $('link[rel="apple-touch-icon"]').attr('href') ||
      ''
    ).replace(/&amp;/g, '&').trim();

    let image = '';
    if (rawImage) {
      if (rawImage.startsWith('//')) {
        image = 'https:' + rawImage;
      } else if (rawImage.startsWith('http')) {
        image = rawImage;
      } else {
        try {
          image = new URL(rawImage, targetUrl).href;
        } catch {
          image = '';
        }
      }
    }

    if (!image && domain) {
      image = `https://image.thum.io/get/width/600/crop/800/${targetUrl}`;
    }

    const metaKeywordsRaw = $('meta[name="keywords"]').attr('content') || '';
    const articleTags = $('meta[property="article:tag"]')
      .map((_, el) => $(el).attr('content'))
      .get()
      .filter(Boolean) as string[];
    const articleSection = $('meta[property="article:section"]').attr('content') || '';

    const metaKeywords = [
      ...metaKeywordsRaw.split(',').map((k) => k.trim()).filter(Boolean),
      ...articleTags,
      articleSection,
    ].filter(Boolean);

    const contentToAnalyze = `${title}. ${description}. Domain: ${domain}`;
    const aiResult = await synthesizeContentWithAI({
      title: title.trim(),
      url: targetUrl,
      text: description || contentToAnalyze,
      contentType: 'link',
      metaKeywords,
    });

    return NextResponse.json({
      title: title.trim(),
      description: aiResult.summary.trim(),
      category: aiResult.category,
      categoryEmoji: aiResult.categoryEmoji,
      categoryColor: aiResult.categoryColor,
      image: image || `https://image.thum.io/get/width/600/crop/800/${targetUrl}`,
      tags: aiResult.tags,
      keyTakeaways: aiResult.keyTakeaways,
    });
  } catch {
    let domainName = 'Saved Link';
    try {
      if (targetUrl) domainName = new URL(targetUrl.startsWith('http') ? targetUrl : 'https://' + targetUrl).hostname.replace('www.', '');
    } catch {}

    const aiResult = await synthesizeContentWithAI({
      title: domainName,
      url: targetUrl,
      text: rawText || domainName,
      contentType: 'link',
    });

    return NextResponse.json({
      title: domainName,
      description: aiResult.summary,
      category: aiResult.category,
      categoryEmoji: aiResult.categoryEmoji,
      categoryColor: aiResult.categoryColor,
      image: targetUrl ? `https://image.thum.io/get/width/600/crop/800/${targetUrl}` : '',
      tags: aiResult.tags,
    });
  }
}
