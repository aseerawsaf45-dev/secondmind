import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { offlineSync, type SyncHandlers } from '../src/lib/offline-sync';
import type { MemoryItem } from '../src/lib/data';

// ── In-Memory LocalStorage Mock ──────────────────────────────────────────────
class MockLocalStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

// Setup global browser shims for Node testing environment
let mockStorage: MockLocalStorage;
let mockOnline = true;

beforeEach(() => {
  mockStorage = new MockLocalStorage();
  mockOnline = true;

  (globalThis as unknown as { localStorage: unknown }).localStorage = mockStorage;
  (globalThis as unknown as { window: unknown }).window = globalThis;

  try {
    Object.defineProperty(globalThis.navigator, 'onLine', {
      get: () => mockOnline,
      configurable: true,
    });
  } catch {
    (globalThis as unknown as { navigator: unknown }).navigator = {
      get onLine() {
        return mockOnline;
      },
    };
  }
});

describe('User Experience & Offline Synchronization Flow', () => {
  const TEST_USER_ID = 'user_test_clerk_123';

  const SAMPLE_SAVED_LINKS: MemoryItem[] = [
    {
      id: 'uuid-1',
      type: 'link',
      title: 'Neon Serverless Postgres Guide',
      content: 'https://neon.tech/docs',
      url: 'https://neon.tech/docs',
      sourceDomain: 'neon.tech',
      summary: 'Documentation on serverless Postgres branching and latency.',
      tags: ['Tech', 'Database'],
      isFavorite: true,
      createdAt: new Date().toISOString(),
      relatedIds: [],
      aiProcessed: true,
    },
    {
      id: 'uuid-2',
      type: 'link',
      title: 'Next.js App Router Architecture',
      content: 'https://nextjs.org/docs',
      url: 'https://nextjs.org/docs',
      sourceDomain: 'nextjs.org',
      summary: 'Deep dive into React 19 Server Components and caching.',
      tags: ['React', 'Next.js'],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      relatedIds: [],
      aiProcessed: true,
    },
  ];

  test('User Story 1: When user is online, their saved links are cached in local storage', () => {
    mockOnline = true;

    // Simulate Dashboard fetching from database and caching locally
    offlineSync.cacheUserData(TEST_USER_ID, SAMPLE_SAVED_LINKS, [], {});

    // Assert data is securely saved in localStorage
    const cached = offlineSync.getCachedUserData(TEST_USER_ID);
    assert.equal(cached.items.length, 2);
    assert.equal(cached.items[0].title, 'Neon Serverless Postgres Guide');
    assert.equal(offlineSync.getLastKnownAccountId(), TEST_USER_ID);
  });

  test('User Story 2: When device goes offline, user can still see all previous saved links', () => {
    // 1. Initial online caching
    offlineSync.cacheUserData(TEST_USER_ID, SAMPLE_SAVED_LINKS, [], {});

    // 2. Network disconnects (airplane mode / train commute)
    mockOnline = false;
    assert.equal(offlineSync.isOnline(), false);

    // 3. User opens app in offline mode ('offline-user' session fallback)
    const offlineCached = offlineSync.getCachedUserData('offline-user');

    // Assert previous links remain accessible without network
    assert.equal(offlineCached.items.length, 2);
    assert.equal(offlineCached.items[0].title, 'Neon Serverless Postgres Guide');
    assert.equal(offlineCached.items[1].title, 'Next.js App Router Architecture');
  });

  test('User Story 3: While offline, user saves a new link which is stored locally and queued', () => {
    offlineSync.cacheUserData(TEST_USER_ID, SAMPLE_SAVED_LINKS, [], {});
    mockOnline = false;

    // User captures a new link while offline
    const newOfflineItem: MemoryItem = {
      id: `offline-${Date.now()}`,
      type: 'link',
      title: 'Vercel AI SDK',
      content: 'https://sdk.vercel.ai',
      url: 'https://sdk.vercel.ai',
      sourceDomain: 'sdk.vercel.ai',
      summary: 'Saved locally offline. Will sync with database when online.',
      tags: ['Offline', 'AI'],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      relatedIds: [],
      aiProcessed: false,
    };

    // Store in local cache
    offlineSync.addOfflineItem('offline-user', newOfflineItem);

    // Enqueue sync action
    offlineSync.enqueueAction({
      type: 'save',
      userId: 'offline-user',
      payload: {
        type: 'link',
        title: newOfflineItem.title,
        content: newOfflineItem.content,
        url: newOfflineItem.url,
      },
      tempId: newOfflineItem.id,
      createdAt: Date.now(),
    });

    // Verify item is immediately visible in local dashboard cache
    const currentData = offlineSync.getCachedUserData('offline-user');
    assert.equal(currentData.items.length, 3);
    assert.equal(currentData.items[0].title, 'Vercel AI SDK');
    assert.ok(currentData.items[0].tags.includes('Offline'));

    // Verify 1 pending change queued
    assert.equal(offlineSync.getPendingCount(), 1);
  });

  test('User Story 4: When network reconnects, queued link is saved into the database and cache is remapped', async () => {
    offlineSync.cacheUserData(TEST_USER_ID, SAMPLE_SAVED_LINKS, [], {});
    mockOnline = false;

    const tempOfflineId = 'offline-1700000000';
    const newOfflineItem: MemoryItem = {
      id: tempOfflineId,
      type: 'link',
      title: 'GitHub Copilot Workspace',
      content: 'https://github.com/features/copilot',
      url: 'https://github.com/features/copilot',
      summary: 'Saved locally offline.',
      tags: ['Offline'],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      relatedIds: [],
      aiProcessed: false,
    };

    offlineSync.addOfflineItem(TEST_USER_ID, newOfflineItem);
    offlineSync.enqueueAction({
      type: 'save',
      userId: TEST_USER_ID,
      payload: {
        type: 'link',
        title: newOfflineItem.title,
        content: newOfflineItem.content,
        url: newOfflineItem.url,
      },
      tempId: tempOfflineId,
      createdAt: Date.now(),
    });

    assert.equal(offlineSync.getPendingCount(), 1);

    // Network connection restored!
    mockOnline = true;
    assert.equal(offlineSync.isOnline(), true);

    // Mock database save handler
    let dbSavedRecord: MemoryItem | null = null;
    const mockHandlers: SyncHandlers = {
      saveItem: async (userId, data) => {
        dbSavedRecord = {
          id: 'server-uuid-999', // Database assigned UUID
          type: data.type,
          title: data.title,
          content: data.content,
          url: data.url,
          summary: 'AI Generated Executive Summary from database.',
          tags: ['AI', 'Developer Tools'],
          isFavorite: false,
          createdAt: new Date().toISOString(),
          relatedIds: [],
          aiProcessed: true,
        };
        return dbSavedRecord;
      },
      toggleFavorite: async () => {},
      deleteItem: async () => {},
      updateItem: async () => true,
      createCollection: async () => null,
      deleteCollection: async () => true,
      addItemToCollection: async () => true,
      removeItemFromCollection: async () => true,
    };

    // Trigger sync
    const syncResult = await offlineSync.syncPendingActions(TEST_USER_ID, mockHandlers);

    // Assertions
    assert.equal(syncResult.syncedCount, 1);
    assert.equal(syncResult.errors, 0);
    assert.equal(offlineSync.getPendingCount(), 0);

    // Verify local cache has remapped the temporary offline ID with real server UUID and AI summary
    const updatedCache = offlineSync.getCachedUserData(TEST_USER_ID);
    assert.equal(updatedCache.items.length, 3);
    const syncedItem = updatedCache.items.find(i => i.id === 'server-uuid-999');
    assert.ok(syncedItem, 'Server UUID should replace the temporary offline ID');
    assert.equal(syncedItem?.summary, 'AI Generated Executive Summary from database.');
    assert.equal(syncedItem?.aiProcessed, true);
  });

  test('User Story 5: User toggles favorite while offline, state updates immediately and queues sync', async () => {
    offlineSync.cacheUserData(TEST_USER_ID, SAMPLE_SAVED_LINKS, [], {});
    mockOnline = false;

    // User stars the second item ('uuid-2') while offline
    offlineSync.toggleCachedFavorite(TEST_USER_ID, 'uuid-2', true);
    offlineSync.enqueueAction({
      type: 'toggleFavorite',
      userId: TEST_USER_ID,
      payload: { itemId: 'uuid-2', isFavorite: true },
      createdAt: Date.now(),
    });

    // Check immediate local update
    const cached = offlineSync.getCachedUserData(TEST_USER_ID);
    const item = cached.items.find(i => i.id === 'uuid-2');
    assert.equal(item?.isFavorite, true);
    assert.equal(offlineSync.getPendingCount(), 1);

    // Reconnect and sync
    mockOnline = true;
    let dbUpdated = false;
    const mockHandlers: SyncHandlers = {
      saveItem: async () => null,
      toggleFavorite: async (_userId, itemId, isFav) => {
        if (itemId === 'uuid-2' && isFav === true) dbUpdated = true;
      },
      deleteItem: async () => {},
      updateItem: async () => true,
      createCollection: async () => null,
      deleteCollection: async () => true,
      addItemToCollection: async () => true,
      removeItemFromCollection: async () => true,
    };

    const result = await offlineSync.syncPendingActions(TEST_USER_ID, mockHandlers);
    assert.equal(result.syncedCount, 1);
    assert.equal(dbUpdated, true);
    assert.equal(offlineSync.getPendingCount(), 0);
  });

  test('User Story 6: User deletes a memory while offline, removed immediately from view and queued', async () => {
    offlineSync.cacheUserData(TEST_USER_ID, SAMPLE_SAVED_LINKS, [], {});
    mockOnline = false;

    // User deletes 'uuid-1' while offline
    offlineSync.deleteCachedItem(TEST_USER_ID, 'uuid-1');
    offlineSync.enqueueAction({
      type: 'delete',
      userId: TEST_USER_ID,
      payload: { itemId: 'uuid-1' },
      createdAt: Date.now(),
    });

    // Immediately removed from local view
    const cached = offlineSync.getCachedUserData(TEST_USER_ID);
    assert.equal(cached.items.length, 1);
    assert.equal(cached.items[0].id, 'uuid-2');

    // Reconnect and sync
    mockOnline = true;
    let deletedIdOnDb = '';
    const mockHandlers: SyncHandlers = {
      saveItem: async () => null,
      toggleFavorite: async () => {},
      deleteItem: async (_userId, itemId) => {
        deletedIdOnDb = itemId;
      },
      updateItem: async () => true,
      createCollection: async () => null,
      deleteCollection: async () => true,
      addItemToCollection: async () => true,
      removeItemFromCollection: async () => true,
    };

    const result = await offlineSync.syncPendingActions(TEST_USER_ID, mockHandlers);
    assert.equal(result.syncedCount, 1);
    assert.equal(deletedIdOnDb, 'uuid-1');
    assert.equal(offlineSync.getPendingCount(), 0);
  });
});
