import { config } from 'dotenv';
config({ path: '.env.local' });
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { memoryItems } from '../src/db/schema';
import { eq, desc } from 'drizzle-orm';

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log('Fetching all memory items...');
  const allItems = await db.select().from(memoryItems).orderBy(desc(memoryItems.createdAt));

  const uniqueMap = new Map<string, string>(); // key: `${userId}-${url.toLowerCase()}`, value: itemId
  const duplicatesToDelete: string[] = [];

  for (const item of allItems) {
    if (!item.url) continue; // Skip notes/images without URLs
    
    // Normalize URL
    const normalizedUrl = item.url.trim().toLowerCase();
    const key = `${item.userId}-${normalizedUrl}`;

    if (uniqueMap.has(key)) {
      // This is an older duplicate since we ordered by desc(createdAt)
      duplicatesToDelete.push(item.id);
    } else {
      uniqueMap.set(key, item.id);
    }
  }

  console.log(`Found ${duplicatesToDelete.length} duplicate links.`);

  if (duplicatesToDelete.length > 0) {
    console.log('Deleting duplicates...');
    for (const id of duplicatesToDelete) {
      await db.delete(memoryItems).where(eq(memoryItems.id, id));
    }
    console.log('Successfully removed all duplicate links!');
  } else {
    console.log('No duplicates found. Your profile is clean!');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
