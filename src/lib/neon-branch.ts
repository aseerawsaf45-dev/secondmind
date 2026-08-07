/**
 * neon-branch.ts
 * ──────────────
 * Handles all Neon API calls to create and query per-user database branches.
 * Each user gets their own isolated Neon branch with the full schema.
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

const NEON_API_KEY = process.env.NEON_API_KEY!;
const NEON_PROJECT_ID = process.env.NEON_PROJECT_ID!;

// Root DB — used only to read/write the user_branches registry
function getRootDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle(sql, { schema });
}

/**
 * Retrieve the connection URL for a user's branch from the registry.
 * Returns null if the branch hasn't been provisioned yet.
 */
export async function getBranchUrl(userId: string): Promise<string | null> {
  try {
    const rootDb = getRootDb();
    const rows = await rootDb
      .select({ connectionUrl: schema.userBranches.connectionUrl })
      .from(schema.userBranches)
      .where(eq(schema.userBranches.userId, userId))
      .limit(1);

    return rows[0]?.connectionUrl ?? null;
  } catch (err) {
    console.error('[neon-branch] getBranchUrl error:', err);
    return null;
  }
}

/**
 * Create a Neon branch for a user via the Neon REST API, then:
 * 1. Store the branch connection URL in the user_branches registry.
 * 2. Run CREATE TABLE IF NOT EXISTS for all user tables on the new branch.
 */
export async function createBranchForUser(
  userId: string,
  email: string
): Promise<string> {
  // ── Step 1: Create the branch via Neon API ──────────────────────────────
  const branchName = `user-${userId.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;

  const createRes = await fetch(
    `https://console.neon.tech/api/v2/projects/${NEON_PROJECT_ID}/branches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NEON_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        branch: { name: branchName },
        endpoints: [{ type: 'read_write' }],
      }),
    }
  );

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Neon branch creation failed: ${errText}`);
  }

  const createData = await createRes.json();
  const branchId: string = createData.branch.id;
  const endpoint = createData.endpoints?.[0];

  if (!endpoint) {
    throw new Error('Neon did not return an endpoint for the new branch.');
  }

  // ── Step 2: Build the connection URL for this branch ───────────────────
  // Parse root DATABASE_URL to extract credentials, then swap the host
  const rootUrl = new URL(process.env.DATABASE_URL!);
  const branchHost = endpoint.host;
  const connectionUrl = `postgresql://${rootUrl.username}:${rootUrl.password}@${branchHost}/${rootUrl.pathname.slice(1)}?sslmode=require`;

  // ── Step 3: Store in registry ─────────────────────────────────────────
  const rootDb = getRootDb();
  await rootDb
    .insert(schema.userBranches)
    .values({ userId, email, branchId, connectionUrl })
    .onConflictDoNothing();

  // ── Step 4: Bootstrap schema on the new branch ────────────────────────
  await bootstrapUserSchema(connectionUrl);

  return connectionUrl;
}

/**
 * Run CREATE TABLE IF NOT EXISTS for all user-facing tables on a fresh branch.
 * This mirrors the Drizzle schema without requiring a migration runner at runtime.
 */
async function bootstrapUserSchema(connectionUrl: string): Promise<void> {
  const sql = neon(connectionUrl);

  // memory_items table
  await sql`
    CREATE TABLE IF NOT EXISTS memory_items (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     TEXT NOT NULL,
      type        TEXT NOT NULL,
      title       TEXT NOT NULL,
      content     TEXT NOT NULL,
      url         TEXT,
      source_domain TEXT,
      thumbnail_url TEXT,
      summary     TEXT DEFAULT '',
      tags        JSONB DEFAULT '[]',
      is_favorite BOOLEAN NOT NULL DEFAULT false,
      ai_processed BOOLEAN NOT NULL DEFAULT false,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // collections table
  await sql`
    CREATE TABLE IF NOT EXISTS collections (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id    TEXT NOT NULL,
      name       TEXT NOT NULL,
      emoji      TEXT DEFAULT '📁',
      color      TEXT DEFAULT '#9CA3AF',
      is_smart   BOOLEAN NOT NULL DEFAULT false,
      rules      JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // collection_items table
  await sql`
    CREATE TABLE IF NOT EXISTS collection_items (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      item_id       UUID NOT NULL REFERENCES memory_items(id) ON DELETE CASCADE,
      collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}
