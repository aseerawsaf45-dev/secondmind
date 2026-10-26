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
});
