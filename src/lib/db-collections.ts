'use server';

import { getUserDb } from '@/lib/user-db';
import { collections, collectionItems } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export interface Collection {
  id: string;
  name: string;
  emoji: string;
  color: string;
  isSmart: boolean;
  rules: any;
  itemCount: number;
}

export async function fetchCollectionsAction(userId: string): Promise<Collection[]> {
  try {
    const db = await getUserDb(userId);
    const rows = await db
      .select({
        id: collections.id,
        name: collections.name,
        emoji: collections.emoji,
        color: collections.color,
        isSmart: collections.isSmart,
        rules: collections.rules,
        itemCount: sql<number>`count(${collectionItems.id})::int`,
      })
      .from(collections)
      .leftJoin(collectionItems, eq(collections.id, collectionItems.collectionId))
      .where(eq(collections.userId, userId))
      .groupBy(collections.id)
      .orderBy(collections.createdAt);

    return rows.map(r => ({
      id: r.id,
      name: r.name,
      emoji: r.emoji ?? '📁',
      color: r.color ?? '#9CA3AF',
      isSmart: r.isSmart,
      rules: r.rules,
      itemCount: r.itemCount || 0,
    }));
  } catch (err) {
    console.error('fetchCollections error:', err);
    return [];
  }
}

export async function createCollectionAction(
  userId: string,
  data: { name: string; emoji?: string; color?: string; isSmart?: boolean; rules?: any }
) {
  try {
    const db = await getUserDb(userId);
    const [inserted] = await db
      .insert(collections)
      .values({
        userId,
        name: data.name,
        emoji: data.emoji || '📁',
        color: data.color || '#9CA3AF',
        isSmart: data.isSmart || false,
        rules: data.rules || {},
      })
      .returning();

    return inserted;
  } catch (err) {
    console.error('createCollection error:', err);
    return null;
  }
}

export async function addItemToCollectionAction(itemId: string, collectionId: string, userId: string) {
  try {
    const db = await getUserDb(userId);
    await db
      .insert(collectionItems)
      .values({
        itemId,
        collectionId,
      });

    return true;
  } catch (err) {
    console.error('addItemToCollection error:', err);
    return false;
  }
}

export async function fetchCollectionItemMapAction(userId: string): Promise<Record<string, string[]>> {
  try {
    const db = await getUserDb(userId);
    const rows = await db
      .select({
        itemId: collectionItems.itemId,
        collectionId: collectionItems.collectionId,
      })
      .from(collectionItems)
      .innerJoin(collections, eq(collectionItems.collectionId, collections.id))
      .where(eq(collections.userId, userId));

    const map: Record<string, string[]> = {};
    rows.forEach(r => {
      if (!map[r.itemId]) map[r.itemId] = [];
      map[r.itemId].push(r.collectionId);
    });

    return map;
  } catch (err) {
    console.error('fetchCollectionItemMap error:', err);
    return {};
  }
}
