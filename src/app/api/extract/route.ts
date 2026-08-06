import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

function simpleAIClassifier(text: string): string[] {
  const lower = text.toLowerCase();
  const tags = new Set<string>();
  
  if (lower.match(/ai|machine learning|openai|chatgpt|llm/)) tags.add('AI');
  if (lower.match(/design|ui|ux|figma/)) tags.add('Design');
  if (lower.match(/business|startup|founder|revenue|marketing/)) tags.add('Business');
  if (lower.match(/research|science|paper|study/)) tags.add('Research');
  if (lower.match(/productivity|habit|focus|morning/)) tags.add('Productivity');
  if (lower.match(/philosophy|mindset|thinking|model/)) tags.add('Philosophy');
  if (lower.match(/tech|react|javascript|python|vercel/)) tags.add('Technology');
  if (lower.match(/health|workout|diet/)) tags.add('Health');
  
  return Array.from(tags).slice(0, 3);
}

export async function POST(request: Request) {
  let targetUrl = '';
  try {
    const body = await request.json();
    targetUrl = (body.url || '').trim();

    if (!targetUrl) {
      return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }

    const domain = new URL(targetUrl).hostname.replace('www.', '');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 sec timeout

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json({
        title: domain,
        description: `Saved link from ${domain}`,
        image: '',
        tags: [domain.split('.')[0] || 'Link'],
      });
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || domain;
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || `Saved link from ${domain}`;
    const image = $('meta[property="og:image"]').attr('content') || '';

    const contentToAnalyze = `${title} ${description}`;
    const tags = contentToAnalyze ? simpleAIClassifier(contentToAnalyze) : [];
    
    if (tags.length === 0 && targetUrl.includes('youtube.com')) tags.push('Video');
    if (tags.length === 0 && (targetUrl.includes('twitter.com') || targetUrl.includes('x.com'))) tags.push('Social');
    if (tags.length === 0) tags.push('Link');

    return NextResponse.json({
      title: title.trim(),
      description: description.trim(),
      image,
      tags,
    });
  } catch (error: any) {
    let domainName = 'Saved Link';
    try {
      if (targetUrl) domainName = new URL(targetUrl.startsWith('http') ? targetUrl : 'https://' + targetUrl).hostname.replace('www.', '');
    } catch {}

    return NextResponse.json({
      title: domainName,
      description: `Saved link: ${targetUrl}`,
      image: '',
      tags: ['Link'],
    });
  }
}
