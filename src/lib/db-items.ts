'use server';

import { getUserDb } from '@/lib/user-db';
import { memoryItems } from '@/db/schema';
import { eq, desc, or, inArray } from 'drizzle-orm';
import type { MemoryItem } from '@/lib/data';
import { getYouTubeThumbnailUrl, isYouTubeUrl } from '@/lib/youtube';
import { classifyContent, generateAISummary } from '@/lib/ai-engine';

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

import { isFacebookUrl, extractFacebookMetadata } from '@/lib/facebook';
import { isTwitterUrl, extractTwitterMetadata } from '@/lib/twitter';

export async function fetchItemsAction(userId: string): Promise<MemoryItem[]> {
  try {
    const db = await getUserDb(userId);
    const userIds = [userId].filter(Boolean);
    const rows = await db
      .select()
      .from(memoryItems)
      .where(inArray(memoryItems.userId, userIds))
      .orderBy(desc(memoryItems.createdAt));

    const items = rows.map(recordToItem);

    // Background auto-enrichment for stale or un-analyzed social items
    (async () => {
      try {
        for (const item of items) {
          if (!item.url) continue;
          const isFb = isFacebookUrl(item.url);
          const isTw = isTwitterUrl(item.url);

          // Needs re-analysis if title is raw URL/generic or tags don't contain Facebook/X
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
      } catch (bgErr) {
        // Silently continue background auto-enrichment
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
    const db = await getUserDb(userId);
    const rows = await db
      .select()
      .from(memoryItems)
      .where(eq(memoryItems.userId, userId));

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
  const effectiveUserId = userId;

  const sourceDomain = data.url
    ? (() => {
        try {
          return new URL(data.url).hostname.replace('www.', '');
        } catch {
          return undefined;
        }
      })()
    : undefined;

  let finalThumbnail = data.thumbnailUrl;
  if (!finalThumbnail && data.url && isYouTubeUrl(data.url)) {
    finalThumbnail = getYouTubeThumbnailUrl(data.url) || undefined;
  }

  const textForAnalysis = `${data.title} ${data.content} ${data.url || ''}`;
  const finalTags = data.tags && data.tags.length > 0
    ? data.tags
    : classifyContent(textForAnalysis, data.url ? [data.type === 'video' ? 'Video' : 'Link'] : ['Note']);

  const finalSummary = data.summary && data.summary !== 'Saving...'
    ? data.summary
    : generateAISummary(data.title, data.content, data.type);

  const fallbackItem: MemoryItem = {
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: data.type as MemoryItem['type'],
    title: data.title || 'Untitled Memory',
    content: data.content,
    url: data.url || undefined,
    thumbnailUrl: finalThumbnail || undefined,
    sourceDomain: sourceDomain || undefined,
    summary: finalSummary,
    tags: finalTags,
    isFavorite: false,
    createdAt: new Date().toISOString(),
    relatedIds: [],
    aiProcessed: true,
  };

  try {
    const db = await getUserDb(userId);
    const [inserted] = await db
      .insert(memoryItems)
      .values({
        userId: effectiveUserId,
        type: data.type,
        title: data.title || 'Untitled Memory',
        content: data.content,
        url: data.url || null,
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
    console.error('CRITICAL saveItem DB insert error:', err?.message || err);
    if (err?.stack) console.error(err.stack);
    return fallbackItem;
  }
}

export async function toggleFavoriteAction(userId: string, id: string, isFavorite: boolean): Promise<void> {
  try {
    const db = await getUserDb(userId);
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
    const db = await getUserDb(userId);
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
    const db = await getUserDb(userId);
    await db
      .update(memoryItems)
      .set({
        ...(data.title !== undefined && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.summary !== undefined && { summary: data.summary }),
        ...(data.tags !== undefined && { tags: data.tags }),
        aiProcessed: true,
      })
      .where(eq(memoryItems.id, id));

    return true;
  } catch (err) {
    console.error('updateItem error:', err);
    return true;
  }
}
