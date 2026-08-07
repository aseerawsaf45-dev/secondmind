import { pgTable, text, timestamp, boolean, jsonb, uuid } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ─── User Branch Registry (lives on the ROOT branch only) ───────────────────
// Maps each Clerk userId to their own isolated Neon branch connection URL.
export const userBranches = pgTable('user_branches', {
  userId: text('user_id').primaryKey(),
  email: text('email').notNull(),
  branchId: text('branch_id').notNull(),
  connectionUrl: text('connection_url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const memoryItems = pgTable('memory_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(), // 'link' | 'note' | 'image' | 'pdf' | 'tweet' | 'video'
  title: text('title').notNull(),
  content: text('content').notNull(),
  url: text('url'),
  sourceDomain: text('source_domain'),
  thumbnailUrl: text('thumbnail_url'),
  summary: text('summary').default(''),
  tags: jsonb('tags').$type<string[]>().default([]),
  isFavorite: boolean('is_favorite').default(false).notNull(),
  aiProcessed: boolean('ai_processed').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const collections = pgTable('collections', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  emoji: text('emoji').default('📁'),
  color: text('color').default('#9CA3AF'),
  isSmart: boolean('is_smart').default(false).notNull(),
  rules: jsonb('rules').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const collectionItems = pgTable('collection_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  itemId: uuid('item_id').notNull().references(() => memoryItems.id, { onDelete: 'cascade' }),
  collectionId: uuid('collection_id').notNull().references(() => collections.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
