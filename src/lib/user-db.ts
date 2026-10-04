import '@/lib/init-dns';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/db/schema';

// ── Infer the Drizzle client type once ────────────────────────────────────
type UserDb = ReturnType<typeof drizzle<typeof schema>>;

// ── Shared Singleton Drizzle Client ───────────────────────────────────────
let sharedDb: UserDb | null = null;

/**
 * Get the shared Drizzle client. 
 * Data isolation is handled via `userId` filtering in the queries.
 */
export async function getUserDb(userId: string, email?: string): Promise<UserDb> {
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
 * No-op since we use a shared client.
 */
export function evictUserDbCache(userId: string): void {
  // No-op
}

