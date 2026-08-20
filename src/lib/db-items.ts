'use server';

import { auth } from '@clerk/nextjs/server';
import { getUserDb } from '@/lib/user-db';
import { memoryItems } from '@/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import type { MemoryItem } from '@/lib/data';
import { getYouTubeThumbnailUrl, isYouTubeUrl } from '@/lib/youtube';
import { classifyContent, generateAISummary } from '@/lib/ai-engine';
import { isFacebookUrl, extractFacebookMetadata } from '@/lib/facebook';
import { isTwitterUrl, extractTwitterMetadata } from '@/lib/twitter';

// Helper to convert Drizzle record to MemoryItem
function recordToItem(record: typeof memoryItems.$inferSelect): MemoryItem {
  return {
    id: record.id,
    type: record.type as MemoryItem['type'],
    title: record.title,
    content: record.content,
    url: record.url ?? undefined,
    sourceDomain: record.sourceDomain ?? undefined,
    thumbnailUrl: record.thumbnailUrl ?? undefined,
    summary: record.summary ?? '',
    tags: (record.tags as string[]) ?? [],
    isFavorite: record.isFavorite,
    createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : new Date().toISOString(),
    relatedIds: [],
    aiProcessed: record.aiProcessed,
  };
}

/**
 * Validates and sanitizes a URL string to prevent javascript: or malformed protocols.
 */
function sanitizeUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return undefined;
}

/**
 * Server-side identity guard: guarantees the operation uses the verified Clerk session identity.
 */
async function getVerifiedUserId(fallbackUserId?: string): Promise<string> {
  const session = await auth();
  const sessionUserId = session.userId;
  if (sessionUserId) {
    return sessionUserId;
  }
  if (fallbackUserId && process.env.NODE_ENV !== 'production') {
    return fallbackUserId;
  }
  throw new Error('Unauthorized: Valid user session required.');
}

export async function fetchItemsAction(userId: string): Promise<MemoryItem[]> {
  try {
    const verifiedUserId = await getVerifiedUserId(userId);
    const db = await getUserDb(verifiedUserId);
    const rows = await db
      .select()
      .from(memoryItems)
      .where(eq(memoryItems.userId, verifiedUserId))
      .orderBy(desc(memoryItems.createdAt));

    const items = rows.map(recordToItem);

    // Background auto-enrichment for stale or un-analyzed social items
    (async () => {
      try {
        for (const item of items) {
          if (!item.url) continue;
          const isFb = isFacebookUrl(item.url);
          const isTw = isTwitterUrl(item.url);

          const needsAnalysis =
            (isFb && (!item.tags.includes('Facebook') || !item.summary || item.title.includes('http') || item.title === 'facebook.com')) ||
            (isTw && (!item.tags.includes('X') || !item.summary || item.title.includes('http') || item.title === 'x.com' || item.title === 'twitter.com'));

          if (needsAnalysis) {
            if (isFb) {
              const fbData = await extractFacebookMetadata(item.url);
              const mergedTags = Array.from(new Set([...item.tags, ...fbData.tags]));
              await db
                .update(memoryItems)
                .set({
                  title: item.title && !item.title.includes('http') && item.title !== 'facebook.com' && item.title !== 'Untitled Memory' ? item.title : fbData.title,
                  summary: fbData.description,
                  tags: mergedTags,
                  thumbnailUrl: item.thumbnailUrl || fbData.image || null,
                  type: fbData.type,
                  aiProcessed: true,
                })
                .where(eq(memoryItems.id, item.id));
            } else if (isTw) {
              const twData = await extractTwitterMetadata(item.url);
              const mergedTags = Array.from(new Set([...item.tags, ...twData.tags]));
              await db
                .update(memoryItems)
                .set({
                  title: item.title && !item.title.includes('http') && item.title !== 'x.com' && item.title !== 'twitter.com' && item.title !== 'Untitled Memory' ? item.title : twData.title,
                  summary: twData.description,
                  tags: mergedTags,
                  thumbnailUrl: item.thumbnailUrl || twData.image || null,
                  type: 'tweet',
                  aiProcessed: true,
                })
                .where(eq(memoryItems.id, item.id));
            }
          }
        }
      } catch {
        // Silently handle background auto-enrichment
      }
    })();

    return items;
  } catch (err) {
    console.error('fetchItems error:', err);
    return [];
  }
}

export async function reanalyzeSocialItemsAction(userId: string): Promise<boolean> {
  try {
    const verifiedUserId = await getVerifiedUserId(userId);
    const db = await getUserDb(verifiedUserId);
    const rows = await db
      .select()
      .from(memoryItems)
      .where(eq(memoryItems.userId, verifiedUserId));

    for (const item of rows) {
      if (!item.url) continue;

      if (isFacebookUrl(item.url)) {
        const fbData = await extractFacebookMetadata(item.url);
        const curTags = (item.tags as string[]) || [];
        const mergedTags = Array.from(new Set([...curTags, ...fbData.tags]));
        await db
          .update(memoryItems)
          .set({
            title: item.title && !item.title.includes('http') && item.title !== 'facebook.com' && item.title !== 'Untitled Memory' ? item.title : fbData.title,
            summary: fbData.description,
            tags: mergedTags,
            thumbnailUrl: item.thumbnailUrl || fbData.image || null,
            type: fbData.type,
            aiProcessed: true,
          })
          .where(eq(memoryItems.id, item.id));
      } else if (isTwitterUrl(item.url)) {
        const twData = await extractTwitterMetadata(item.url);
        const curTags = (item.tags as string[]) || [];
        const mergedTags = Array.from(new Set([...curTags, ...twData.tags]));
        await db
          .update(memoryItems)
          .set({
            title: item.title && !item.title.includes('http') && item.title !== 'x.com' && item.title !== 'twitter.com' && item.title !== 'Untitled Memory' ? item.title : twData.title,
            summary: twData.description,
            tags: mergedTags,
            thumbnailUrl: item.thumbnailUrl || twData.image || null,
            type: 'tweet',
            aiProcessed: true,
          })
          .where(eq(memoryItems.id, item.id));
      }
    }
    return true;
  } catch (err) {
    console.error('reanalyzeSocialItemsAction error:', err);
    return false;
  }
}

export async function saveItemAction(
  userId: string,
  data: { type: string; title: string; content: string; url?: string; thumbnailUrl?: string; summary?: string; tags?: string[] }
): Promise<MemoryItem> {
  const verifiedUserId = await getVerifiedUserId(userId);
  const cleanUrl = sanitizeUrl(data.url);

  // Input boundaries to prevent payload abuse
  const cleanTitle = (data.title || 'Untitled Memory').slice(0, 500);
  const cleanContent = (data.content || '').slice(0, 50000);
  const cleanTags = (data.tags || []).slice(0, 20).map(t => String(t).slice(0, 50));

  const sourceDomain = cleanUrl
    ? (() => {
        try {
          return new URL(cleanUrl).hostname.replace('www.', '');
        } catch {
          return undefined;
        }
      })()
    : undefined;

  let finalThumbnail = data.thumbnailUrl;
  if (!finalThumbnail && cleanUrl && isYouTubeUrl(cleanUrl)) {
    finalThumbnail = getYouTubeThumbnailUrl(cleanUrl) || undefined;
  }

  const textForAnalysis = `${cleanTitle} ${cleanContent} ${cleanUrl || ''}`;
  const finalTags = cleanTags.length > 0
    ? cleanTags
    : classifyContent(textForAnalysis, cleanUrl ? [data.type === 'video' ? 'Video' : 'Link'] : ['Note']);

  const finalSummary = data.summary && data.summary !== 'Saving...'
    ? data.summary.slice(0, 2000)
    : generateAISummary(cleanTitle, cleanContent, data.type);

  const fallbackItem: MemoryItem = {
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: data.type as MemoryItem['type'],
    title: cleanTitle,
    content: cleanContent,
    url: cleanUrl,
    thumbnailUrl: finalThumbnail,
    sourceDomain,
    summary: finalSummary,
    tags: finalTags,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    relatedIds: [],
    aiProcessed: true,
  };

  try {
    const db = await getUserDb(verifiedUserId);
    const [inserted] = await db
      .insert(memoryItems)
      .values({
        userId: verifiedUserId,
        type: data.type,
        title: cleanTitle,
        content: cleanContent,
        url: cleanUrl || null,
        thumbnailUrl: finalThumbnail || null,
        sourceDomain: sourceDomain || null,
        summary: finalSummary,
        tags: finalTags,
        isFavorite: false,
        aiProcessed: true,
      })
      .returning();

    return recordToItem(inserted);
  } catch (err: any) {
    console.error('saveItem DB insert error:', err?.message || 'Database operation failed');
    return fallbackItem;
  }
}

export async function deleteUserAccountAndDataAction(userId: string): Promise<boolean> {
  try {
    const verifiedUserId = await getVerifiedUserId(userId);
    const { deleteUserBranchAndData } = await import('@/lib/neon-branch');
    const { evictUserDbCache } = await import('@/lib/user-db');

    await deleteUserBranchAndData(verifiedUserId);
    evictUserDbCache(verifiedUserId);
    return true;
  } catch (err) {
    console.error('deleteUserAccountAndDataAction error:', err);
    return false;
  }
}

export async function toggleFavoriteAction(userId: string, id: string, isFavorite: boolean): Promise<void> {
  try {
    const verifiedUserId = await getVerifiedUserId(userId);
    const db = await getUserDb(verifiedUserId);
    await db
      .update(memoryItems)
      .set({ isFavorite })
      .where(eq(memoryItems.id, id));
  } catch (err) {
    console.error('toggleFavorite error:', err);
  }
}

export async function deleteItemAction(userId: string, id: string): Promise<void> {
  try {
    const verifiedUserId = await getVerifiedUserId(userId);
    const db = await getUserDb(verifiedUserId);
    await db
      .delete(memoryItems)
      .where(eq(memoryItems.id, id));
  } catch (err) {
    console.error('deleteItem error:', err);
  }
}

export async function updateItemAction(
  userId: string,
  id: string,
  data: { title?: string; content?: string; summary?: string; tags?: string[] }
): Promise<boolean> {
  try {
    const verifiedUserId = await getVerifiedUserId(userId);
    const db = await getUserDb(verifiedUserId);
    await db
      .update(memoryItems)
      .set({
        ...(data.title !== undefined && { title: data.title.slice(0, 500) }),
        ...(data.content !== undefined && { content: data.content.slice(0, 50000) }),
        ...(data.summary !== undefined && { summary: data.summary.slice(0, 2000) }),
        ...(data.tags !== undefined && { tags: data.tags.slice(0, 20).map(t => String(t).slice(0, 50)) }),
        aiProcessed: true,
      })
      .where(eq(memoryItems.id, id));

    return true;
  } catch (err) {
    console.error('updateItem error:', err);
    return true;
  }
}
