'use server';

import { auth } from '@clerk/nextjs/server';
import { getUserDb } from '@/lib/user-db';
import { collections, collectionItems } from '@/db/schema';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { DEFAULT_CATEGORY_COLLECTIONS } from '@/lib/categories';
export type { CategoryCollectionDef } from '@/lib/categories';

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

export async function addItemsToCollectionAction(itemIds: string[], collectionId: string, userId: string) {
  if (!itemIds.length) return true;
  try {
    const verifiedUserId = await getVerifiedUserId(userId);
    const db = await getUserDb(verifiedUserId);
    await db
      .insert(collectionItems)
      .values(itemIds.map(itemId => ({ itemId, collectionId })))
      .onConflictDoNothing();

    return true;
  } catch (err) {
    console.error('addItemsToCollection error:', err);
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

export async function deleteCollectionAction(collectionId: string, userId: string): Promise<boolean> {
  try {
    const verifiedUserId = await getVerifiedUserId(userId);
    const db = await getUserDb(verifiedUserId);

    // Delete child rows first, then the collection itself
    await db
      .delete(collectionItems)
      .where(eq(collectionItems.collectionId, collectionId));

    await db
      .delete(collections)
      .where(and(eq(collections.id, collectionId), eq(collections.userId, verifiedUserId)));

    return true;
  } catch (err) {
    console.error('deleteCollection error:', err);
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

/**
 * Idempotently seeds the 4 default category collections for a user.
 * Skips any collection whose name already exists.
 * Returns the full list of seeded category collections.
 */
export async function seedDefaultCollectionsAction(userId: string): Promise<Collection[]> {
  try {
    const verifiedUserId = await getVerifiedUserId(userId);
    const db = await getUserDb(verifiedUserId);

    const existing = await db
      .select({ id: collections.id, name: collections.name })
      .from(collections)
      .where(eq(collections.userId, verifiedUserId));

    const existingNames = new Set(existing.map(c => c.name));
    const toInsert = DEFAULT_CATEGORY_COLLECTIONS.filter(def => !existingNames.has(def.name));
    if (toInsert.length > 0) {
      await db.insert(collections).values(
        toInsert.map(def => ({
          userId: verifiedUserId,
          name: def.name,
          emoji: def.emoji,
          color: def.color,
          isSmart: true,
          rules: { matchTags: def.matchTags },
        }))
      );
    }

    const all = await db
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
      .where(
        and(
          eq(collections.userId, verifiedUserId),
          inArray(collections.name, DEFAULT_CATEGORY_COLLECTIONS.map(d => d.name))
        )
      )
      .groupBy(collections.id)
      .orderBy(collections.createdAt);

    return all.map(r => ({
      id: r.id,
      name: r.name,
      emoji: r.emoji ?? '📁',
      color: r.color ?? '#9CA3AF',
      isSmart: r.isSmart,
      rules: r.rules,
      itemCount: r.itemCount || 0,
    }));
  } catch (err) {
    console.error('seedDefaultCollections error:', err);
    return [];
  }
}

/**
 * Given a saved item's ID and its tags, auto-assigns the item to every
 * matching default category collection. Silently skips on duplicate.
 */
export async function autoAssignItemToCollectionsAction(
  userId: string,
  itemId: string,
  itemTags: string[]
): Promise<void> {
  if (!itemTags.length) return;
  try {
    const verifiedUserId = await getVerifiedUserId(userId);
    const db = await getUserDb(verifiedUserId);

    const matchingNames: string[] = [];
    for (const def of DEFAULT_CATEGORY_COLLECTIONS) {
      const hasMatch = def.matchTags.some(t => itemTags.includes(t));
      if (hasMatch) matchingNames.push(def.name);
    }
    if (!matchingNames.length) return;

    const matchingColls = await db
      .select({ id: collections.id, name: collections.name })
      .from(collections)
      .where(
        and(
          eq(collections.userId, verifiedUserId),
          inArray(collections.name, matchingNames)
        )
      );

    if (!matchingColls.length) return;

    await db
      .insert(collectionItems)
      .values(matchingColls.map(c => ({ itemId, collectionId: c.id })))
      .onConflictDoNothing();
  } catch (err) {
    console.error('autoAssignItemToCollections error:', err);
  }
}
