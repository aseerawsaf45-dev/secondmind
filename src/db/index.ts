import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

import { validateEnv } from '@/lib/env';

let databaseUrl = process.env.DATABASE_URL?.trim() || '';

if (databaseUrl && !databaseUrl.includes('sslmode=')) {
  databaseUrl += (databaseUrl.includes('?') ? '&' : '?') + 'sslmode=require';
}

if (!databaseUrl && process.env.NODE_ENV === 'production') {
  validateEnv();
}

const sql = neon(databaseUrl || 'postgresql://unconfigured');

export const db = drizzle(sql, { schema });


