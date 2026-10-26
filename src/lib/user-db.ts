import '@/lib/init-dns';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, inArray } from 'drizzle-orm';
import * as schema from '@/db/schema';

// ── Infer the Drizzle client type once ────────────────────────────────────
type UserDb = ReturnType<typeof drizzle<typeof schema>>;

// ── Shared Singleton Drizzle Client ───────────────────────────────────────
let sharedDb: UserDb | null = null;

/**
 * Get the shared Drizzle client. 
 * Data isolation is handled via `userId` filtering in the queries.
 */
export async function getUserDb(_userId?: string, _email?: string): Promise<UserDb> {
  if (sharedDb) {
    return sharedDb;
  }

  let dbUrl = process.env.DATABASE_URL || '';
  if (dbUrl && !dbUrl.includes('sslmode=')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'sslmode=require';
  }

  const sql = neon(dbUrl);
  sharedDb = drizzle(sql, { schema });

  return sharedDb;
}

/**
 * Wipe all user data from the shared database (GDPR Right to Erasure).
 */
export async function deleteUserData(userId: string): Promise<boolean> {
  try {
    const db = await getUserDb();

    const userColls = await db
      .select({ id: schema.collections.id })
      .from(schema.collections)
      .where(eq(schema.collections.userId, userId));

    const collIds = userColls.map(c => c.id);
    if (collIds.length > 0) {
      await db
        .delete(schema.collectionItems)
        .where(inArray(schema.collectionItems.collectionId, collIds));
    }

    await db
      .delete(schema.collections)
      .where(eq(schema.collections.userId, userId));

    await db
      .delete(schema.memoryItems)
      .where(eq(schema.memoryItems.userId, userId));

    return true;
  } catch (err) {
    console.error('[deleteUserData] error:', err);
    return false;
  }
}

/**
 * No-op since we use a shared client.
 */
export function evictUserDbCache(_userId?: string): void {
  // No-op
}
