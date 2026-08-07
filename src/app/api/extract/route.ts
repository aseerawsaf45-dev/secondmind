import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { extractYouTubeVideoId, fetchYouTubeOEmbed, isYouTubeUrl, getYouTubeThumbnailUrl } from '@/lib/youtube';
import { classifyContent, generateAISummary } from '@/lib/ai-engine';

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
      const summary = generateAISummary(generatedTitle, rawText, 'note');
      const tags = classifyContent(rawText);

      return NextResponse.json({
        title: generatedTitle,
        description: summary,
        image: '',
        tags,
      });
    }

    if (!targetUrl) {
      return NextResponse.json({ error: 'Missing URL or text' }, { status: 400 });
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
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

      const tags = classifyContent(`${ytTitle} ${ytDescription} youtube video`, ['Video']);

      return NextResponse.json({
        title: ytTitle.trim(),
        description: ytDescription.trim(),
        image: ytThumbnail || '',
        tags,
      });
    }

    // 3. General web page extraction via Cheerio
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    let res;
    try {
      res = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        }
      });
    } catch {
      res = null;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res || !res.ok) {
      const fallbackTitle = domain;
      const fallbackSummary = `Saved bookmark from ${domain}.`;
      const fallbackTags = classifyContent(`${domain} ${targetUrl}`, [domain.split('.')[0] || 'Link']);

      return NextResponse.json({
        title: fallbackTitle,
        description: fallbackSummary,
        image: '',
        tags: fallbackTags,
      });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || domain;
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    const image = $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || '';

    const contentToAnalyze = `${title} ${description} ${domain}`;
    const tags = classifyContent(contentToAnalyze, [domain.split('.')[0] || 'Link']);
    const summary = generateAISummary(title, description || contentToAnalyze, 'link');

    return NextResponse.json({
      title: title.trim(),
      description: summary.trim(),
      image: image ? (image.startsWith('http') ? image : new URL(image, targetUrl).href) : '',
      tags,
    });
  } catch (error: any) {
    let domainName = 'Saved Link';
    try {
      if (targetUrl) domainName = new URL(targetUrl.startsWith('http') ? targetUrl : 'https://' + targetUrl).hostname.replace('www.', '');
    } catch {}

    const tags = classifyContent(`${domainName} ${rawText}`, ['Link']);

    return NextResponse.json({
      title: domainName,
      description: `Saved memory link from ${domainName}.`,
      image: '',
      tags,
    });
  }
}
