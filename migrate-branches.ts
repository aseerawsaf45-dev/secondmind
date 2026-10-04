import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './src/db/schema';
import { eq } from 'drizzle-orm';

async function migrate() {
  let dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl) throw new Error('No DATABASE_URL');
  if (dbUrl && !dbUrl.includes('sslmode=')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'sslmode=require';
  }
  
  const rootSql = neon(dbUrl);
  const rootDb = drizzle(rootSql, { schema });

  const branches = await rootDb.select().from(schema.userBranches);
  console.log(`Found ${branches.length} branches to migrate`);

  for (const branch of branches) {
    console.log(`Migrating data for user ${branch.userId} from branch ${branch.branchId}...`);
    try {
      let bUrl = branch.connectionUrl;
      if (bUrl && !bUrl.includes('sslmode=')) {
        bUrl += (bUrl.includes('?') ? '&' : '?') + 'sslmode=require';
      }
      const branchSql = neon(bUrl);
      const branchDb = drizzle(branchSql, { schema });

      // 1. memory_items
      const items = await branchDb.select().from(schema.memoryItems).where(eq(schema.memoryItems.userId, branch.userId));
      console.log(` - ${items.length} memory_items`);
      if (items.length > 0) {
        await rootDb.insert(schema.memoryItems).values(items).onConflictDoNothing();
      }

      // 2. collections
      const colls = await branchDb.select().from(schema.collections).where(eq(schema.collections.userId, branch.userId));
      console.log(` - ${colls.length} collections`);
      if (colls.length > 0) {
        await rootDb.insert(schema.collections).values(colls).onConflictDoNothing();
      }

      // 3. collection_items
      const cItems = await branchDb.select().from(schema.collectionItems);
      console.log(` - ${cItems.length} collection_items`);
      if (cItems.length > 0) {
        await rootDb.insert(schema.collectionItems).values(cItems).onConflictDoNothing();
      }

      console.log(`Finished migrating user ${branch.userId}`);
    } catch (err) {
      console.error(`Error migrating branch ${branch.branchId}:`, err);
    }
  }
  
  console.log('Migration complete!');
}

migrate().catch(console.error);
