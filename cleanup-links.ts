import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './src/db/schema';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';
import { eq, inArray } from 'drizzle-orm';
import { classifyContent } from './src/lib/ai-engine';

config({ path: '.env.local' });

const RESTRICTED_TAGS = ['Social Media', 'Facebook', 'Twitter', 'X', 'LinkedIn', 'Instagram', 'TikTok'];

async function cleanup() {
  console.log('Starting tag optimization on ROOT DB...');
  let dbUrl = process.env.DATABASE_URL || '';
  if (dbUrl && !dbUrl.includes('sslmode=')) {
    dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'sslmode=require';
  }
  
  if (!dbUrl) {
    console.error('No DATABASE_URL found');
    return;
  }

  const rootSql = neon(dbUrl);
  const db = drizzle(rootSql, { schema });

  const allItems = await db.select().from(schema.memoryItems);
  console.log(`  Found ${allItems.length} items in root DB`);

  const toUpdateTags: { id: string; tags: string[] }[] = [];
  const seenUrls = new Set<string>();
  const toDeleteIds: string[] = [];

  for (const item of allItems) {
    // 1. Remove duplicate URLs
    if (item.url) {
      if (seenUrls.has(item.url)) {
        toDeleteIds.push(item.id);
        continue;
      } else {
        seenUrls.add(item.url);
      }
    }

    // Re-classify to inject new broad topic tags
    const textToAnalyze = `${item.title || ''} ${item.content || ''} ${item.summary || ''}`;
    let optimizedTags = classifyContent(textToAnalyze, [], {
      title: item.title,
      url: item.url || undefined,
      contentType: item.type
    });
    
    // Ensure no restricted tags
    optimizedTags = optimizedTags.filter(t => !RESTRICTED_TAGS.includes(t));

    toUpdateTags.push({ id: item.id, tags: optimizedTags });
  }

  if (toDeleteIds.length > 0) {
    console.log(`  Deleting ${toDeleteIds.length} duplicate items...`);
    await db.delete(schema.memoryItems).where(inArray(schema.memoryItems.id, toDeleteIds));
  }

  if (toUpdateTags.length > 0) {
    console.log(`  Updating optimized tags for ${toUpdateTags.length} items...`);
    for (const update of toUpdateTags) {
      await db.update(schema.memoryItems)
        .set({ tags: update.tags })
        .where(eq(schema.memoryItems.id, update.id));
    }
  }

  console.log('Tag optimization finished!');
}

cleanup().catch(console.error);
