import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/db/schema';
import { getBranchUrl, createBranchForUser } from '@/lib/neon-branch';

// ── Infer the Drizzle client type once ────────────────────────────────────
type UserDb = ReturnType<typeof drizzle<typeof schema>>;

// ── In-process cache: userId → Drizzle client ─────────────────────────────
const dbCache = new Map<string, UserDb>();

/**
 * Get (or lazily provision) a Drizzle client for a specific user's branch.
 *
 * @param userId   - Clerk user ID
 * @param email    - User email, required only on first-time provisioning
 */
export async function getUserDb(userId: string, email?: string): Promise<UserDb> {
  // 1. Return cached client if available
  if (dbCache.has(userId)) {
    return dbCache.get(userId)!;
  }

  // 2. Look up branch URL from registry
  let connectionUrl = await getBranchUrl(userId);

  // 3. If no branch exists yet, provision one on-the-fly
  if (!connectionUrl) {
    const userEmail = email ?? `${userId}@unknown.user`;
    console.log(`[user-db] Provisioning new branch for user ${userId}…`);
    connectionUrl = await createBranchForUser(userId, userEmail);
  }

  // 4. Build and cache the Drizzle client
  const sql = neon(connectionUrl);
  const db = drizzle(sql, { schema });
  dbCache.set(userId, db);

  return db;
}

/**
 * Remove a cached client instance for a given user.
 */
export function evictUserDbCache(userId: string): void {
  dbCache.delete(userId);
}

