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
  
  return Array.from(tags).slice(0, 3); // Max 3 tags
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch URL: ${res.statusText}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    const image = $('meta[property="og:image"]').attr('content') || '';

    // Simulated AI processing
    const contentToAnalyze = `${title} ${description}`;
    const tags = contentToAnalyze ? simpleAIClassifier(contentToAnalyze) : [];
    
    // Fallback tagging logic if nothing matched
    if (tags.length === 0 && url.includes('youtube.com')) tags.push('Video');
    if (tags.length === 0 && (url.includes('twitter.com') || url.includes('x.com'))) tags.push('Social');

    return NextResponse.json({
      title: title.trim(),
      description: description.trim(),
      image,
      tags,
    });
  } catch (error: any) {
    console.error('Extract error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
