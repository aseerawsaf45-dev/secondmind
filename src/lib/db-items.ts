'use server';

import { db } from '@/db';
import { memoryItems } from '@/db/schema';
import { eq, desc, or, inArray } from 'drizzle-orm';
import type { MemoryItem } from '@/lib/data';

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

export async function fetchItemsAction(userId: string): Promise<MemoryItem[]> {
  try {
    const userIds = [userId, 'demo-user', 'default-user'].filter(Boolean);
    const rows = await db
      .select()
      .from(memoryItems)
      .where(inArray(memoryItems.userId, userIds))
      .orderBy(desc(memoryItems.createdAt));

    return rows.map(recordToItem);
  } catch (err) {
    console.error('fetchItems error:', err);
    return [];
  }
}

export async function saveItemAction(
  userId: string,
  data: { type: string; title: string; content: string; url?: string; thumbnailUrl?: string; summary?: string; tags?: string[] }
): Promise<MemoryItem> {
  const effectiveUserId = userId || 'demo-user';

  const sourceDomain = data.url
    ? (() => {
        try {
          return new URL(data.url).hostname.replace('www.', '');
        } catch {
          return undefined;
        }
      })()
    : undefined;

  const fallbackItem: MemoryItem = {
    id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: data.type as MemoryItem['type'],
    title: data.title || 'Untitled Memory',
    content: data.content,
    url: data.url || undefined,
    thumbnailUrl: data.thumbnailUrl || undefined,
    sourceDomain: sourceDomain || undefined,
    summary: data.summary || 'Saved memory item',
    tags: data.tags || [],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    relatedIds: [],
    aiProcessed: !!data.summary || !!data.tags?.length,
  };

  try {
    const [inserted] = await db
      .insert(memoryItems)
      .values({
        userId: effectiveUserId,
        type: data.type,
        title: data.title,
        content: data.content,
        url: data.url || null,
        thumbnailUrl: data.thumbnailUrl || null,
        sourceDomain: sourceDomain || null,
        summary: data.summary || '',
        tags: data.tags || [],
        isFavorite: false,
        aiProcessed: !!data.summary || !!data.tags?.length,
      })
      .returning();

    return recordToItem(inserted);
  } catch (err) {
    console.error('saveItem DB insert error:', err);
    return fallbackItem;
  }
}

export async function toggleFavoriteAction(userId: string, id: string, isFavorite: boolean): Promise<void> {
  try {
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
