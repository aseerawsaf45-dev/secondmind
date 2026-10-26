import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  CATEGORY_DEFINITIONS,
  getPrimaryCategory,
  isItemInCategory,
  matchCategoriesForItem,
} from '../src/lib/categories';
import { resolveCollectionFlaticon } from '../src/components/icons/PremiumIcons';
import { classifyContent } from '../src/lib/ai-engine';

describe('Vibe Coding / AI Category & Thumbnail Preview Suite', () => {
  test('CATEGORY_DEFINITIONS includes Vibe Coding / AI category', () => {
    const vibeCat = CATEGORY_DEFINITIONS.find(c => c.name === 'Vibe Coding / AI');
    assert.ok(vibeCat, 'Vibe Coding / AI category must exist in CATEGORY_DEFINITIONS');
    assert.equal(vibeCat.id, 'vibe-coding-ai');
    assert.equal(vibeCat.emoji, '⚡');
    assert.ok(vibeCat.matchTags.includes('Vibe Coding'));
    assert.ok(vibeCat.keywords.includes('cursor'));
  });

  test('getPrimaryCategory assigns Vibe Coding / AI based on tags and keywords', () => {
    // Tag match
    const fromTag = getPrimaryCategory(['Vibe Coding'], 'Building an app with AI', 'https://example.com');
    assert.equal(fromTag.name, 'Vibe Coding / AI');

    // Keyword match
    const fromKeywords = getPrimaryCategory(
      [],
      'Vibe coding an entire SaaS MVP using Cursor and Claude Code in one evening',
      'https://twitter.com/buildinpublic'
    );
    assert.equal(fromKeywords.name, 'Vibe Coding / AI');
  });

  test('isItemInCategory matches items with Vibe Coding / AI tags and content', () => {
    const item = {
      title: 'Fullstack App with Lovable and Supabase',
      content: 'Vibe coding prompt-driven fullstack development',
      url: 'https://lovable.dev',
      tags: ['Lovable', 'Vibe Coding'],
    };

    assert.ok(isItemInCategory(item, 'Vibe Coding / AI'));
    assert.ok(isItemInCategory(item, 'vibe-coding-ai'));
  });

  test('classifyContent extracts Vibe Coding and AI Coding tags', () => {
    const tags = classifyContent(
      'How I used Cursor editor and Claude Code for prompt to code vibe coding workflow',
      [],
      { title: 'Modern Vibe Coding Guide', url: 'https://cursor.com' }
    );

    assert.ok(tags.includes('Vibe Coding') || tags.includes('AI Coding'));
  });

  test('resolveCollectionFlaticon maps Vibe Coding / AI to bolt icon', () => {
    const resolved = resolveCollectionFlaticon('Vibe Coding / AI');
    assert.equal(resolved.icon, 'bolt');
    assert.equal(resolved.animation, 'pulse');
  });

  test('getFacebookThumbnailUrl returns guaranteed valid SVG data URI preview for Facebook links', async () => {
    const { getFacebookThumbnailUrl, isFacebookUrl } = await import('../src/lib/facebook');
    assert.ok(isFacebookUrl('https://www.facebook.com/techcrunch/posts/10161479848124952'));
    assert.ok(isFacebookUrl('https://www.facebook.com/reel/1083981296614488'));
    assert.ok(isFacebookUrl('https://fb.watch/xyz123'));

    const thumbPost = getFacebookThumbnailUrl('https://www.facebook.com/zuck/posts/10114972173516591', 'Meta Connect 2026 Keynote', 'zuck');
    assert.ok(thumbPost.startsWith('data:image/svg+xml;charset=utf-8,'));
    assert.ok(thumbPost.includes('Meta%20Connect%202026%20Keynote') || thumbPost.includes('Meta'));

    const thumbReel = getFacebookThumbnailUrl('https://www.facebook.com/reel/1083981296614488', 'Next.js 15 Agent Tips', 'NextJsDev');
    assert.ok(thumbReel.startsWith('data:image/svg+xml;charset=utf-8,'));
    assert.ok(thumbReel.includes('REEL'));
  });

  test('isItemInCategory prevents false positive over-matching across unrelated categories', () => {
    const financeItem = {
      title: 'Bitcoin ETF Inflows Surpass $2 Billion',
      content: 'Institutions allocate capital to cryptocurrency portfolios and dividend stocks.',
      url: 'https://bloomberg.com/crypto/bitcoin-etf',
      tags: ['Investing & Stocks', 'Crypto & Web3'],
    };

    assert.ok(isItemInCategory(financeItem, 'Finance & Crypto'));
    // Must NOT match Media & Reads or Web Development
    assert.equal(isItemInCategory(financeItem, 'Media & Reads'), false);
    assert.equal(isItemInCategory(financeItem, 'Web Development'), false);
    assert.equal(isItemInCategory(financeItem, 'UI/UX & Design'), false);
  });

  test('Category item counting accurately matches filtered items', () => {
    const items = [
      {
        id: '1',
        title: 'Bitcoin ETF Inflows',
        content: 'Crypto investing',
        url: 'https://bloomberg.com',
        tags: ['Investing & Stocks'],
        isFavorite: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Figma Design System Guide',
        content: 'Design components and typography',
        url: 'https://figma.com',
        tags: ['UI/UX Design', 'Figma'],
        isFavorite: false,
        createdAt: new Date().toISOString(),
      },
    ];

    const financeColl = {
      id: 'c-finance',
      name: 'Finance & Crypto',
      isSmart: true,
      rules: { matchTags: ['Investing & Stocks', 'Crypto & Web3'] },
    };

    const count = items.filter(i => {
      const matchTags = financeColl.rules.matchTags;
      const hasTag = matchTags.some(t => i.tags.includes(t)) || i.tags.includes(financeColl.name);
      const hasCat = isItemInCategory(i, financeColl.name);
      return hasTag || hasCat;
    }).length;

    assert.equal(count, 1, 'Finance & Crypto count must be exactly 1');
  });
});
