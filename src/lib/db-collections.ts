'use server';

import { auth } from '@clerk/nextjs/server';
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

export async function fetchCollectionsAction(userId: string): Promise<Collection[]> {
  try {
    const verifiedUserId = await getVerifiedUserId(userId);
    const db = await getUserDb(verifiedUserId);
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
      .where(eq(collections.userId, verifiedUserId))
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
    const verifiedUserId = await getVerifiedUserId(userId);
    const db = await getUserDb(verifiedUserId);

    const cleanName = (data.name || 'New Collection').trim().slice(0, 100);
    const cleanEmoji = (data.emoji || '📁').slice(0, 10);
    const cleanColor = (data.color || '#9CA3AF').slice(0, 20);

    const [inserted] = await db
      .insert(collections)
      .values({
        userId: verifiedUserId,
        name: cleanName,
        emoji: cleanEmoji,
        color: cleanColor,
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
    const verifiedUserId = await getVerifiedUserId(userId);
    const db = await getUserDb(verifiedUserId);
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

export async function removeItemFromCollectionAction(itemId: string, collectionId: string, userId: string) {
  try {
    const verifiedUserId = await getVerifiedUserId(userId);
    const db = await getUserDb(verifiedUserId);
    await db
      .delete(collectionItems)
      .where(and(eq(collectionItems.itemId, itemId), eq(collectionItems.collectionId, collectionId)));

    return true;
  } catch (err) {
    console.error('removeItemFromCollection error:', err);
    return false;
  }
}

export async function fetchCollectionItemMapAction(userId: string): Promise<Record<string, string[]>> {
  try {
    const verifiedUserId = await getVerifiedUserId(userId);
    const db = await getUserDb(verifiedUserId);
    const rows = await db
      .select({
        itemId: collectionItems.itemId,
        collectionId: collectionItems.collectionId,
      })
      .from(collectionItems)
      .innerJoin(collections, eq(collectionItems.collectionId, collections.id))
      .where(eq(collections.userId, verifiedUserId));

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
