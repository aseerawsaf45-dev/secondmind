import type { MemoryItem } from '@/lib/data';
import type { Collection } from '@/lib/db-collections';
import { CATEGORY_DEFINITIONS, isItemInCategory } from '@/lib/categories';

const PREFIX = 'secondmind_guest_';

function getLocal<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const raw = localStorage.getItem(PREFIX + key);
  return raw ? JSON.parse(raw) : defaultValue;
}

function setLocal<T>(key: string, value: T) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  }
}

const DEMO_ITEMS: MemoryItem[] = [];
const DEMO_COLLECTIONS: Collection[] = [];
const DEMO_ITEM_MAP: Record<string, string[]> = {};

export const localDb = {
  fetchItems: async (): Promise<MemoryItem[]> => {
    const raw = getLocal<MemoryItem[]>('items', []);
    // Remove any template data saved links of guest mode (demo-*)
    const clean = raw.filter(item => !item.id.startsWith('demo-'));
    if (clean.length !== raw.length) {
      setLocal('items', clean);
    }
    return clean;
  },
  
  saveItem: async (data: any): Promise<MemoryItem> => {
    const items = await localDb.fetchItems();
    const newItem: MemoryItem = {
      id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: data.type,
      title: data.title || 'Untitled Memory',
      content: data.content || '',
      url: data.url,
      thumbnailUrl: data.thumbnailUrl,
      sourceDomain: data.url ? (() => { try { return new URL(data.url).hostname.replace('www.', ''); } catch { return undefined; } })() : undefined,
      summary: data.summary || '',
      tags: data.tags || [],
      isFavorite: false,
      createdAt: new Date().toISOString(),
      relatedIds: [],
      aiProcessed: false,
    };
    setLocal('items', [newItem, ...items]);
    return newItem;
  },
  
  toggleFavorite: async (id: string, isFavorite: boolean): Promise<void> => {
    const items = await localDb.fetchItems();
    setLocal('items', items.map(i => i.id === id ? { ...i, isFavorite } : i));
  },
  
  deleteItem: async (id: string): Promise<void> => {
    const items = await localDb.fetchItems();
    setLocal('items', items.filter(i => i.id !== id));
    const map = await localDb.fetchCollectionItemMap();
    delete map[id];
    setLocal('itemMap', map);
  },
  
  updateItem: async (id: string, data: any): Promise<boolean> => {
    const items = await localDb.fetchItems();
    setLocal('items', items.map(i => i.id === id ? { ...i, ...data } : i));
    return true;
  },

  fetchCollections: async (): Promise<Collection[]> => {
    const raw = getLocal<Collection[]>('collections', []);
    const clean = raw.filter(c => !c.id.startsWith('demo-coll-'));
    if (clean.length !== raw.length) {
      setLocal('collections', clean);
    }
    return clean;
  },
  
  createCollection: async (data: any): Promise<Collection> => {
    const colls = await localDb.fetchCollections();
    const newColl: Collection = {
      id: `local-coll-${Date.now()}`,
      name: data.name,
      emoji: data.emoji || '📁',
      color: data.color || '#9CA3AF',
      isSmart: data.isSmart || false,
      rules: data.rules || {},
      itemCount: 0,
    };
    setLocal('collections', [...colls, newColl]);
    return newColl;
  },
  
  deleteCollection: async (id: string): Promise<boolean> => {
    const colls = await localDb.fetchCollections();
    setLocal('collections', colls.filter(c => c.id !== id));
    const map = await localDb.fetchCollectionItemMap();
    for (const itemId in map) {
      map[itemId] = map[itemId].filter(cId => cId !== id);
    }
    setLocal('itemMap', map);
    return true;
  },
  
  fetchCollectionItemMap: async (): Promise<Record<string, string[]>> => {
    return getLocal<Record<string, string[]>>('itemMap', {});
  },
  
  addItemToCollection: async (itemId: string, collectionId: string): Promise<boolean> => {
    const map = await localDb.fetchCollectionItemMap();
    if (!map[itemId]) map[itemId] = [];
    if (!map[itemId].includes(collectionId)) {
      map[itemId].push(collectionId);
      setLocal('itemMap', map);
    }
    return true;
  },
  
  addItemsToCollection: async (itemIds: string[], collectionId: string): Promise<boolean> => {
    const map = await localDb.fetchCollectionItemMap();
    itemIds.forEach(id => {
      if (!map[id]) map[id] = [];
      if (!map[id].includes(collectionId)) map[id].push(collectionId);
    });
    setLocal('itemMap', map);
    return true;
  },
  
  removeItemFromCollection: async (itemId: string, collectionId: string): Promise<boolean> => {
    const map = await localDb.fetchCollectionItemMap();
    if (map[itemId]) {
      map[itemId] = map[itemId].filter(id => id !== collectionId);
      setLocal('itemMap', map);
    }
    return true;
  },
  
  seedDefaultCollections: async (): Promise<void> => {
    const colls = await localDb.fetchCollections();
    const existingNames = new Set(colls.map(c => c.name));
    const toAdd = CATEGORY_DEFINITIONS
      .filter(def => !existingNames.has(def.name))
      .map(def => ({
        id: `guest-cat-${def.id}`,
        name: def.name,
        emoji: def.emoji,
        color: def.color,
        isSmart: true,
        rules: { matchTags: def.matchTags },
        itemCount: 0,
      }));

    if (toAdd.length > 0) {
      setLocal('collections', [...colls, ...toAdd]);
    }
  },

  /** Template demo data removed per user requirement */
  seedDemoContent: async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PREFIX + 'demo_seeded');
  },
  
  autoAssignItemToCollections: async (): Promise<boolean> => {
    try {
      const items = await localDb.fetchItems();
      const colls = await localDb.fetchCollections();
      const map = await localDb.fetchCollectionItemMap();

      for (const item of items) {
        if (!map[item.id]) map[item.id] = [];
        const itemTags = item.tags || [];

        for (const coll of colls) {
          const matchTags: string[] = coll.rules?.matchTags || [];
          const hasTagMatch = matchTags.some(t => itemTags.includes(t));
          const hasCategoryMatch = isItemInCategory(item, coll.name);

          if ((hasTagMatch || hasCategoryMatch) && !map[item.id].includes(coll.id)) {
            map[item.id].push(coll.id);
          }
        }
      }

      setLocal('itemMap', map);
      return true;
    } catch {
      return false;
    }
  },

  /** Checks if there are real user items stored in localStorage waiting to be migrated */
  hasUnmigratedGuestData: (): boolean => {
    if (typeof window === 'undefined') return false;
    const items = getLocal<MemoryItem[]>('items', []);
    return items.some(i => !i.id.startsWith('demo-'));
  },

  /** Retrieves guest data for account migration (excluding any demo data) */
  getGuestDataForMigration: async () => {
    const items = (await localDb.fetchItems()).filter(i => !i.id.startsWith('demo-'));
    const collections = await localDb.fetchCollections();
    const itemMap = await localDb.fetchCollectionItemMap();
    return { items, collections, itemMap };
  },

  /** Clears guest items from localStorage after successful migration */
  clearGuestData: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PREFIX + 'items');
    localStorage.removeItem(PREFIX + 'collections');
    localStorage.removeItem(PREFIX + 'itemMap');
    localStorage.removeItem(PREFIX + 'demo_seeded');
  },

  /** Exports all guest data as a downloadable JSON file */
  exportData: async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    const items = await localDb.fetchItems();
    const collections = await localDb.fetchCollections();
    const itemMap = await localDb.fetchCollectionItemMap();
    const blob = new Blob(
      [JSON.stringify({ items, collections, itemMap, exportedAt: new Date().toISOString() }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `secondmind-guest-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
